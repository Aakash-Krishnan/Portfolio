import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aakash-krishnan.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/vault/", "/api/admin/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
