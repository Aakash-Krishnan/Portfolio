import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const RESUME_VAULT_COOKIE = "resume_vault_session";
const SESSION_SALT = "resume-vault-v1";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function getResumeVaultPath(): string {
  const path = process.env.RESUME_VAULT_PATH ?? "/vault/resume";
  return path.startsWith("/") ? path : `/${path}`;
}

function getAdminPassword(): string | undefined {
  return process.env.RESUME_ADMIN_PASSWORD;
}

export function isVaultConfigured(): boolean {
  return Boolean(
    getAdminPassword() &&
      process.env.HYGRAPH_ENDPOINT &&
      process.env.HYGRAPH_TOKEN &&
      (process.env.HYGRAPH_ASSET_TOKEN ?? process.env.HYGRAPH_TOKEN),
  );
}

function createSessionToken(): string {
  const password = getAdminPassword();
  if (!password) {
    throw new Error("RESUME_ADMIN_PASSWORD is not set");
  }
  return createHmac("sha256", normalizeEnvValue(password))
    .update(SESSION_SALT)
    .digest("hex");
}

function normalizeEnvValue(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function verifyVaultPassword(input: string): boolean {
  const password = getAdminPassword();
  if (!password) return false;

  const expected = normalizeEnvValue(password);
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export async function setVaultSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(RESUME_VAULT_COOKIE, createSessionToken(), getSessionCookieOptions());
}

export async function clearVaultSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(RESUME_VAULT_COOKIE);
}

export async function hasVaultSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(RESUME_VAULT_COOKIE)?.value;
  if (!session || !isVaultConfigured()) return false;

  try {
    const expected = createSessionToken();
    const a = Buffer.from(session);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function requireVaultSession(): Promise<void> {
  if (!(await hasVaultSession())) {
    throw new Error("Unauthorized");
  }
}
