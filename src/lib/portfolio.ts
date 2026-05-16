import { fetchPortfolio } from "@/lib/hygraph/client";
import type { PortfolioData } from "@/types/portfolio";

function sortByOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

function normalize(data: PortfolioData): PortfolioData {
  return {
    site: {
      ...data.site,
      heroStats: sortByOrder(data.site.heroStats),
      aboutStats: sortByOrder(data.site.aboutStats),
      navLinks: sortByOrder(data.site.navLinks),
      contactLinks: sortByOrder(data.site.contactLinks),
      statusLines: sortByOrder(data.site.statusLines),
    },
    skillCategories: sortByOrder(data.skillCategories).map((category) => ({
      ...category,
      skills: sortByOrder(category.skills),
    })),
    experiences: sortByOrder(data.experiences).map((experience) => ({
      ...experience,
      points: sortByOrder(experience.points),
    })),
    projects: sortByOrder(data.projects),
  };
}

export async function getPortfolioData(): Promise<PortfolioData> {
  const fromCms = await fetchPortfolio("main");

  if (!fromCms) {
    throw new Error(
      "[hygraph] Portfolio CMS fetch failed. Ensure HYGRAPH_TOKEN and HYGRAPH_ENDPOINT are set, " +
        'use the Content API URL (not CDN), and that SiteSettings with slug "main" is published.',
    );
  }

  return normalize(fromCms);
}
