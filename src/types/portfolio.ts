export type StatSection = "HERO" | "ABOUT";

export type SkillCategoryTheme =
  | "PRIMARY"
  | "CYAN"
  | "ORANGE"
  | "YELLOW"
  | "PURPLE";

export interface PortfolioStat {
  value: string;
  suffix?: string | null;
  label: string;
  numericValue?: number | null;
  sortOrder: number;
  section?: StatSection;
}

export interface PortfolioNavLink {
  label: string;
  href: string;
  sortOrder: number;
}

export interface PortfolioContactLink {
  label: string;
  value: string;
  href: string;
  sortOrder: number;
}

export interface PortfolioStatusLine {
  label: string;
  value: string;
  valueClass: string;
  sortOrder: number;
}

export interface PortfolioAsset {
  url: string;
  fileName: string;
  mimeType?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
}

export interface PortfolioSiteSettings {
  slug: string;
  fullName: string;
  nickname: string;
  email: string;
  location: string;
  timezone: string;
  heroLabel: string;
  heroTagline: string;
  aboutHeading: string;
  aboutBio: string;
  contactIntro: string;
  footerLine1: string;
  footerLine2: string;
  resumeUrl: string;
  resume?: PortfolioAsset | null;
  aboutPhoto?: PortfolioAsset | null;
  openToWork: boolean;
  avgResponse: string;
  lookingFor: string;
  typewriterNames: string[];
  marqueeItems: string[];
  packageName: string;
  packageRole: string;
  versionTooltip: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogSiteName: string;
  twitterTitle: string;
  twitterDescription: string;
  siteUrl: string;
  heroStats: PortfolioStat[];
  aboutStats: PortfolioStat[];
  navLinks: PortfolioNavLink[];
  contactLinks: PortfolioContactLink[];
  statusLines: PortfolioStatusLine[];
}

export interface PortfolioSkill {
  name: string;
  version: string;
  sortOrder: number;
}

export interface PortfolioSkillCategory {
  key: string;
  displayLabel: string;
  theme: SkillCategoryTheme;
  sortOrder: number;
  skills: PortfolioSkill[];
}

export interface PortfolioExperiencePoint {
  text: string;
  sortOrder: number;
}

export interface PortfolioExperience {
  hash: string;
  role: string;
  company: string;
  period: string;
  tag: string;
  isHead: boolean;
  author: string;
  sortOrder: number;
  points: PortfolioExperiencePoint[];
}

export interface PortfolioProject {
  name: string;
  organization: string;
  description: string;
  highlight: string;
  stack: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
  isInternal: boolean;
  sortOrder: number;
}

export interface PortfolioAchievement {
  title: string;
  event: string;
  placement: string;
  description: string;
  highlight: string;
  topics: string[];
  certificateUrl?: string | null;
  certificateUrls?: string[] | null;
  certificates?: PortfolioAsset[] | null;
  sortOrder: number;
}

export interface PortfolioData {
  site: PortfolioSiteSettings;
  skillCategories: PortfolioSkillCategory[];
  experiences: PortfolioExperience[];
  achievements: PortfolioAchievement[];
  projects: PortfolioProject[];
}
