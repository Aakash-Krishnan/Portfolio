import type { Graph, Person, WebSite, ProfilePage, ItemList, Thing } from "schema-dts";
import type { PortfolioData } from "@/types/portfolio";

export function buildPortfolioGraph(data: PortfolioData): Graph {
  const { site, projects, experiences } = data;
  const base = site.siteUrl.replace(/\/$/, "");

  const sameAs = site.contactLinks
    .map((l) => l.href)
    .filter((href) => href.startsWith("https://"));

  const person: Person = {
    "@type": "Person",
    "@id": `${base}/#person`,
    name: site.fullName,
    email: site.email,
    jobTitle: site.packageRole,
    url: base,
    ...(site.aboutPhoto ? { image: site.aboutPhoto.url } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  const website: WebSite = {
    "@type": "WebSite",
    "@id": `${base}/#website`,
    url: base,
    name: site.metaTitle,
  };

  const profilePage: ProfilePage = {
    "@type": "ProfilePage",
    "@id": `${base}/#profilepage`,
    url: base,
    name: site.metaTitle,
    description: site.metaDescription,
    mainEntity: { "@id": `${base}/#person` },
    ...(site.aboutPhoto ? { image: site.aboutPhoto.url } : {}),
  };

  const publicProjects = projects.filter((p) => !p.isInternal);

  const projectList: ItemList = {
    "@type": "ItemList",
    "@id": `${base}/#projects`,
    name: "Projects",
    itemListElement: publicProjects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "CreativeWork",
        name: p.name,
        description: p.description,
        url: p.liveUrl ?? p.githubUrl ?? base,
      } as Thing,
    })),
  };

  const experienceList: ItemList = {
    "@type": "ItemList",
    "@id": `${base}/#experience`,
    name: "Work Experience",
    itemListElement: experiences.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Role",
        roleName: e.role,
        worksFor: { "@type": "Organization", name: e.company },
        description: e.period,
      } as Thing,
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [website, person, profilePage, projectList, experienceList],
  };
}
