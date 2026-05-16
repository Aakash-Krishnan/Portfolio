import { PORTFOLIO_QUERY } from "@/lib/hygraph/queries";
import type { PortfolioData } from "@/types/portfolio";

const ENDPOINT = process.env.HYGRAPH_ENDPOINT;

interface PortfolioQueryResponse {
  allSiteSettings: PortfolioData["site"][];
  skillCategories: PortfolioData["skillCategories"];
  experiences: PortfolioData["experiences"];
  projects: PortfolioData["projects"];
}

export async function fetchPortfolio(
  slug = "main",
): Promise<PortfolioData | null> {
  if (!ENDPOINT) {
    throw new Error("[hygraph] HYGRAPH_ENDPOINT is not set");
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: PORTFOLIO_QUERY,
      variables: { slug },
    }),
    next: { revalidate: 60, tags: ["portfolio"] },
  });

  if (!response.ok) {
    console.error(
      "[hygraph] HTTP error",
      response.status,
      await response.text(),
    );
    return null;
  }

  const json = (await response.json()) as {
    data?: PortfolioQueryResponse;
    errors?: { message: string }[];
  };

  if (json.errors?.length) {
    console.error("[hygraph] GraphQL errors", json.errors);
    return null;
  }

  const site = json.data?.allSiteSettings?.[0];
  if (!site) return null;

  return {
    site,
    skillCategories: json.data?.skillCategories ?? [],
    experiences: json.data?.experiences ?? [],
    projects: json.data?.projects ?? [],
  };
}
