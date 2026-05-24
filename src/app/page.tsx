import TerminalWrapper from "@/components/layout/TerminalWrapper";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Achievements from "@/components/sections/Achievements";
import Contact from "@/components/sections/Contact";
import { getPortfolioData } from "@/lib/portfolio";
import { getResumeLink } from "@/lib/resume";
import JsonLd from "@/components/meta/JsonLd";

export default async function Home() {
  const portfolio = await getPortfolioData();
  const resume = getResumeLink(portfolio.site);

  return (
    <TerminalWrapper navLinks={portfolio.site.navLinks} resume={resume}>
      <JsonLd data={portfolio} />
      <main id="main-content">
        <Hero site={portfolio.site} resume={resume} />
        <About site={portfolio.site} />
        <Experience experiences={portfolio.experiences} />
        <Achievements achievements={portfolio.achievements} />
        <Skills site={portfolio.site} categories={portfolio.skillCategories} />
        <Projects projects={portfolio.projects} />
        <Contact site={portfolio.site} />
      </main>
    </TerminalWrapper>
  );
}
