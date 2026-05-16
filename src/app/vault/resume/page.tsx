import type { Metadata } from "next";
import { ResumeVault } from "@/components/vault/resume-vault";
import { hasVaultSession, isVaultConfigured } from "@/lib/resume-vault-auth";

export const metadata: Metadata = {
  title: "Resume vault",
  robots: { index: false, follow: false },
};

export default async function ResumeVaultPage() {
  const configured = isVaultConfigured();
  const authenticated = configured && (await hasVaultSession());

  if (!configured) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="font-mono text-sm text-muted text-center max-w-md">
          Resume vault is not configured. Set{" "}
          <code className="text-primary">RESUME_ADMIN_PASSWORD</code>,{" "}
          <code className="text-primary">HYGRAPH_TOKEN</code> (Site Settings update + publish),{" "}
          <code className="text-primary">HYGRAPH_ASSET_TOKEN</code> (Asset upload), and{" "}
          <code className="text-primary">HYGRAPH_ENDPOINT</code>.
        </p>
      </main>
    );
  }

  return (
    <main>
      <ResumeVault initialAuthenticated={authenticated} />
    </main>
  );
}
