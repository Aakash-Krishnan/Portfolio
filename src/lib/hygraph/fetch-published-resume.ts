import { getHygraphCdnEndpoint } from "@/lib/hygraph/content-endpoint";

const RESUME_SNAPSHOT_QUERY = /* GraphQL */ `
  query PublishedResume($slug: String!) {
    allSiteSettings(where: { slug: $slug }, stage: PUBLISHED, first: 1) {
      resumeUrl
      resume {
        url
        fileName
      }
    }
  }
`;

export interface PublishedResumeSnapshot {
  sourceUrl: string;
  fileName: string;
}

export async function fetchPublishedResume(
  slug = "main",
): Promise<PublishedResumeSnapshot | null> {
  const response = await fetch(getHygraphCdnEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: RESUME_SNAPSHOT_QUERY,
      variables: { slug },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as {
    data?: {
      allSiteSettings: {
        resumeUrl: string | null;
        resume: { url: string; fileName: string } | null;
      }[];
    };
  };

  const site = json.data?.allSiteSettings?.[0];
  if (!site) return null;

  const sourceUrl = site.resume?.url ?? site.resumeUrl ?? null;
  if (!sourceUrl) return null;

  const fileName =
    site.resume?.fileName ??
    fileNameFromUrl(sourceUrl) ??
    "resume.pdf";

  return { sourceUrl, fileName };
}

function fileNameFromUrl(url: string): string | null {
  try {
    const segment = new URL(url).pathname.split("/").pop();
    if (segment?.toLowerCase().endsWith(".pdf")) {
      return segment;
    }
  } catch {
    // ignore
  }
  return null;
}
