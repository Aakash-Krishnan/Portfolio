import type { PortfolioSiteSettings } from "@/types/portfolio";

export interface ResumeLink {
  href: string;
  fileName: string;
}

export function getResumeLink(site: PortfolioSiteSettings): ResumeLink | null {
  const fileName = site.resume?.fileName ?? "resume.pdf";

  if (site.resume?.url || site.resumeUrl) {
    return {
      href: "/api/resume",
      fileName,
    };
  }

  return null;
}

/** Direct Hygraph or fallback URL — proxied by /api/resume for in-browser viewing. */
export function getResumeSourceUrl(site: PortfolioSiteSettings): string | null {
  return site.resume?.url ?? site.resumeUrl ?? null;
}
