"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Phase = "login" | "upload";

export function ResumeVault({ initialAuthenticated }: { initialAuthenticated: boolean }) {
  const [phase, setPhase] = useState<Phase>(initialAuthenticated ? "upload" : "login");
  const [password, setPassword] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/resume/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }
      setPassword("");
      setPhase("upload");
      setMessage("Unlocked. Upload a new PDF below.");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Choose a PDF first.");
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/admin/resume/upload", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as { error?: string; fileName?: string };
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      setFile(null);
      setFileInputKey((k) => k + 1);
      setMessage(
        data.fileName
          ? `Published "${data.fileName}". Open your homepage and hard-refresh (⌘⇧R), then use Resume — or visit /api/resume.`
          : "Resume published.",
      );
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/resume/auth", { method: "DELETE" });
    setPhase("login");
    setFile(null);
    setMessage(null);
    setError(null);
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <Card className="border-border bg-surface text-text ring-foreground/10">
        <CardHeader>
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Private vault
          </p>
          <CardTitle className="font-mono text-text">Resume upload</CardTitle>
          <CardDescription className="text-muted">
            {phase === "login"
              ? "Enter your password to replace the public resume."
              : "Upload a PDF. It will be published to your portfolio immediately."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {phase === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vault-password" className="text-muted">
                  Password
                </Label>
                <Input
                  id="vault-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-border bg-background text-text"
                  required
                />
              </div>
              <Button type="submit" disabled={busy} className="w-full">
                {busy ? "Checking…" : "Unlock"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resume-file" className="text-muted">
                  PDF (max 5 MB)
                </Label>
                <input
                  key={fileInputKey}
                  id="resume-file"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm text-text file:mr-3 file:border-0 file:bg-transparent file:font-mono file:text-primary"
                  required
                />
              </div>
              <Button type="submit" disabled={busy || !file} className="w-full">
                {busy ? "Uploading & publishing… (30–60s)" : "Publish resume"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={handleLogout}
                className="w-full text-muted"
              >
                Lock vault
              </Button>
            </form>
          )}

          {error && (
            <p role="alert" className="font-mono text-sm text-red-400">
              {error}
            </p>
          )}
          {message && (
            <p className="font-mono text-sm text-primary">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
