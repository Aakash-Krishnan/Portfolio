import { fetchPublishedResume } from "@/lib/hygraph/fetch-published-resume";

export const dynamic = "force-dynamic";

export async function GET() {
  const published = await fetchPublishedResume();

  if (!published) {
    return new Response("Resume not found", { status: 404 });
  }

  const upstream = await fetch(published.sourceUrl, { cache: "no-store" });
  if (!upstream.ok) {
    return new Response("Resume unavailable", { status: 502 });
  }

  const body = upstream.body;
  if (!body) {
    return new Response("Resume unavailable", { status: 502 });
  }

  const fileName =
    fileNameFromContentDisposition(
      upstream.headers.get("content-disposition"),
    ) ?? published.fileName;

  return new Response(body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}

function fileNameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const match = /filename\*?=(?:UTF-8''|")?([^";\n]+)/i.exec(header);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1].replace(/"/g, ""));
  } catch {
    return match[1].replace(/"/g, "");
  }
}
