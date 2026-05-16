import { NextResponse } from "next/server";
import {
  clearVaultSession,
  isVaultConfigured,
  setVaultSession,
  verifyVaultPassword,
} from "@/lib/resume-vault-auth";

export async function POST(request: Request) {
  if (!isVaultConfigured()) {
    return NextResponse.json(
      { error: "Resume vault is not configured on the server." },
      { status: 503 },
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!verifyVaultPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  await setVaultSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearVaultSession();
  return NextResponse.json({ ok: true });
}
