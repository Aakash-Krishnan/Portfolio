import { fetchPortfolio } from "@/lib/hygraph/client";
import type { PortfolioData, PortfolioNavLink } from "@/types/portfolio";

function sortByOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Ensures Achievements nav exists until Site Settings is updated in Hygraph Studio. */
function withAchievementsNav(links: PortfolioNavLink[]): PortfolioNavLink[] {
  const sorted = sortByOrder(links);
  if (sorted.some((link) => link.href === "#achievements")) {
    return sorted;
  }

  const achievementsLink: PortfolioNavLink = {
    label: "Achievements",
    href: "#achievements",
    sortOrder: 2,
  };

  const reindexed = sorted.map((link) =>
    link.sortOrder >= 2 ? { ...link, sortOrder: link.sortOrder + 1 } : link,
  );

  return sortByOrder([...reindexed, achievementsLink]);
}

function normalize(data: PortfolioData): PortfolioData {
  return {
    site: {
      ...data.site,
      heroStats: sortByOrder(data.site.heroStats),
      aboutStats: sortByOrder(data.site.aboutStats),
      navLinks: withAchievementsNav(data.site.navLinks),
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
    achievements: sortByOrder(data.achievements),
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
