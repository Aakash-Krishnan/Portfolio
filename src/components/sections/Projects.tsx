"use client";

import { useEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsap";
import type { PortfolioProject } from "@/types/portfolio";

export default function Projects({
  projects,
}: {
  projects: PortfolioProject[];
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll<HTMLElement>(".project-card");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let observer: IntersectionObserver | undefined;
    loadGsap().then((gsap) => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer!.disconnect();
          if (prefersReducedMotion) {
            gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
            return;
          }
          gsap.fromTo(
            cards,
            { opacity: 0, y: 60, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.65,
              stagger: 0.2,
              ease: "power3.out",
            },
          );
        },
        { root: document.getElementById("terminal-scroll"), threshold: 0.1 },
      );
      observer.observe(section);
    });
    return () => observer?.disconnect();
  }, []);

  const rafRef = useRef<number | null>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = e.currentTarget;
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const rect = card.getBoundingClientRect();
      const rotateX =
        ((clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -6;
      const rotateY =
        ((clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 6;
      loadGsap().then((gsap) => {
        gsap.to(card, {
          rotateX,
          rotateY,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 800,
        });
      });
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = e.currentTarget;
    loadGsap().then((gsap) => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
      });
    });
  };

  return (
    <section
      id="projects"
      ref={sectionRef}
      aria-labelledby="projects-heading"
      className="my-20 py-4 px-6"
    >
      <div className="max-w-4xl mx-auto">
        <p
          className="font-mono text-primary text-sm mb-4 tracking-wider"
          aria-hidden="true"
        >
          $ ls ./projects
        </p>
        <h2
          id="projects-heading"
          className="text-3xl font-bold text-text mb-12"
        >
          What I Shipped
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.name}
              className="project-card opacity-0 bg-surface border border-border rounded-xl p-6 flex flex-col hover:border-primary/40 transition-colors duration-300 group"
              style={{ transformStyle: "preserve-3d", willChange: "transform" }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-text font-semibold text-lg group-hover:text-primary transition-colors duration-200">
                    {project.name}
                  </h3>
                  <p className="font-mono text-xs text-muted mt-0.5">
                    {project.organization}
                  </p>
                </div>
                {project.isInternal && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded border border-yellow-600/40 text-yellow-500/70 shrink-0">
                    internal
                  </span>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-primary transition-colors duration-200"
                    aria-label={`${project.name} on GitHub (opens in new tab)`}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                )}
              </div>
              <p className="text-sm text-muted leading-relaxed mb-4 flex-1">
                {project.description}
              </p>
              <p className="font-mono text-xs text-primary/70 mb-4 border-l-2 border-primary/30 pl-3">
                {project.highlight}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-background border border-border text-muted"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div className="project-card opacity-0 bg-surface/40 border border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-48">
            <div className="font-mono text-muted text-sm mb-2">
              next_project.exe
            </div>
            <div className="flex items-center gap-2 text-xs text-muted/50 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
              Currently compiling...
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
