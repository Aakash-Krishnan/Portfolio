import type { NextConfig } from "next";

const INTERNAL_VAULT_PATH = "/vault/resume";

function normalizePath(path: string): string {
  if (!path.startsWith("/")) return `/${path}`;
  return path.replace(/\/+$/, "") || "/";
}

const customVaultPath = process.env.RESUME_VAULT_PATH
  ? normalizePath(process.env.RESUME_VAULT_PATH)
  : null;

const nextConfig: NextConfig = {
  async redirects() {
    if (customVaultPath && customVaultPath !== INTERNAL_VAULT_PATH) {
      return [
        {
          source: INTERNAL_VAULT_PATH,
          destination: "/",
          permanent: false,
        },
      ];
    }
    return [];
  },
  async rewrites() {
    if (customVaultPath && customVaultPath !== INTERNAL_VAULT_PATH) {
      return [
        {
          source: customVaultPath,
          destination: INTERNAL_VAULT_PATH,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
