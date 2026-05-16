import type { Metadata } from "next";
import type { PortfolioSiteSettings } from "@/types/portfolio";

const DEFAULT_SITE_URL = "https://aakash-krishnan.vercel.app/";

const DEFAULT_KEYWORDS = [
  "Next.js",
  "React",
  "TypeScript",
  "Frontend Developer",
  "Chennai",
];

/** Maps Hygraph SiteSettings SEO fields → Next.js Metadata API */
export function buildPortfolioMetadata(site: PortfolioSiteSettings): Metadata {
  const baseUrl = new URL(site.siteUrl || DEFAULT_SITE_URL);

  return {
    title: site.metaTitle,
    description: site.metaDescription,
    keywords: site.metaKeywords?.length ? site.metaKeywords : DEFAULT_KEYWORDS,
    authors: [{ name: site.fullName }],
    metadataBase: baseUrl,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: site.ogTitle,
      description: site.ogDescription,
      type: "website",
      url: baseUrl,
      siteName: site.ogSiteName,
    },
    twitter: {
      card: "summary_large_image",
      title: site.twitterTitle,
      description: site.twitterDescription,
    },
  };
}
