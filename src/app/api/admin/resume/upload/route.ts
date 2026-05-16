import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { publishResumeToPortfolio } from "@/lib/hygraph/admin";
import {
  isVaultConfigured,
  requireVaultSession,
} from "@/lib/resume-vault-auth";

const MAX_BYTES = 5 * 1024 * 1024;

/** PDF processing + publish can exceed the default ~60s route limit. */
export const maxDuration = 120;

export async function POST(request: Request) {
  if (!isVaultConfigured()) {
    return NextResponse.json(
      { error: "Resume vault is not configured on the server." },
      { status: 503 },
    );
  }

  try {
    await requireVaultSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "PDF file is required." }, { status: 400 });
  }

  const isPdf =
    file.type === "application/pdf" ||
    file.type === "application/x-pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File must be 5 MB or smaller." },
      { status: 400 },
    );
  }

  const fileName = file.name.endsWith(".pdf") ? file.name : `${file.name}.pdf`;

  try {
    const asset = await publishResumeToPortfolio(file, fileName);

    revalidateTag("portfolio", "max");
    revalidatePath("/");
    revalidatePath("/api/resume");

    return NextResponse.json({
      ok: true,
      fileName: asset.fileName,
      url: asset.url,
    });
  } catch (error) {
    console.error("[resume-vault] upload failed", error);
    const message =
      error instanceof Error ? error.message : "Upload failed. Check server logs.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
