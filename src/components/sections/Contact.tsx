"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { PortfolioSiteSettings } from "@/types/portfolio";

const LINK_ICONS: Record<string, React.ReactNode> = {
  GitHub: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  ),
  LinkedIn: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  Email: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
};

export default function Contact({ site }: { site: PortfolioSiteSettings }) {
  const links = site.contactLinks;
  const terminalStatus = site.statusLines;
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statusLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const content = contentRef.current;
    const section = sectionRef.current;
    if (!content || !section) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!prefersReducedMotion) gsap.set(content, { opacity: 0, y: 40 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        if (prefersReducedMotion) {
          gsap.set(content, { opacity: 1, y: 0 });
          gsap.set(statusLineRefs.current.filter(Boolean), {
            opacity: 1,
            x: 0,
          });
          gsap.set(cardsRef.current.filter(Boolean), { opacity: 1, y: 0 });
          return;
        }

        const tl = gsap.timeline();
        tl.to(content, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
        tl.fromTo(
          statusLineRefs.current.filter(Boolean),
          { opacity: 0, x: -8 },
          {
            opacity: 1,
            x: 0,
            duration: 0.2,
            stagger: 0.07,
            ease: "power2.out",
          },
          "-=0.2",
        );
        tl.fromTo(
          cardsRef.current.filter(Boolean),
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.3",
        );
      },
      { root: document.getElementById("terminal-scroll"), threshold: 0.05 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      aria-labelledby="contact-heading"
      className="my-20 py-4 px-6 bg-surface/30"
    >
      <MotionContactInner
        site={site}
        links={links}
        terminalStatus={terminalStatus}
        contentRef={contentRef}
        statusLineRefs={statusLineRefs}
        cardsRef={cardsRef}
      />
    </section>
  );
}

function MotionContactInner({
  site,
  links,
  terminalStatus,
  contentRef,
  statusLineRefs,
  cardsRef,
}: {
  site: PortfolioSiteSettings;
  links: PortfolioSiteSettings["contactLinks"];
  terminalStatus: PortfolioSiteSettings["statusLines"];
  contentRef: React.RefObject<HTMLDivElement | null>;
  statusLineRefs: React.MutableRefObject<(HTMLParagraphElement | null)[]>;
  cardsRef: React.MutableRefObject<(HTMLAnchorElement | null)[]>;
}) {
  return (
    <div className="max-w-5xl mx-auto">
      <div ref={contentRef}>
        <p
          className="font-mono text-primary text-sm mb-4 tracking-wider"
          aria-hidden="true"
        >
          $ sky --contact
        </p>
        <h2 id="contact-heading" className="text-3xl font-bold text-text mb-12">
          Get In Touch
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="rounded-xl border border-border overflow-hidden">
            <div
              className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface/80"
              aria-hidden="true"
            >
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <span className="w-3 h-3 rounded-full bg-primary/60" />
              <span className="ml-3 font-mono text-xs text-muted/50 select-none">
                sky@terminal — zsh
              </span>
            </div>
            <div
              className="p-5 bg-background/60 font-mono text-sm space-y-1"
              aria-label="Availability status"
            >
              <p className="mb-3" aria-hidden="true">
                <span className="text-primary">$</span>{" "}
                <span className="text-muted">sky --ping</span>
              </p>
              {terminalStatus.map((line, i) => (
                <p
                  key={line.label}
                  ref={(el) => {
                    statusLineRefs.current[i] = el;
                  }}
                  className="text-text pl-2 opacity-0"
                >
                  <span className="text-muted/60">{line.label}:</span>{" "}
                  <span className={line.valueClass}>{line.value}</span>
                </p>
              ))}
              <ContactCursor />
            </div>
          </div>

          <div>
            <p className="text-muted text-sm mb-8 leading-relaxed">
              {site.contactIntro}
            </p>
            <div className="flex items-center gap-4">
              {links.map((link, i) => (
                <a
                  key={link.label}
                  ref={(el) => {
                    cardsRef.current[i] = el;
                  }}
                  href={link.href}
                  target={link.label !== "Email" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={
                    link.label !== "Email"
                      ? `${link.label} (opens in new tab)`
                      : `Send email to ${link.value}`
                  }
                  className="p-4 bg-surface border border-border rounded-xl text-muted hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-colors duration-200 opacity-0"
                >
                  {LINK_ICONS[link.label]}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 text-center font-mono text-sm text-muted/50">
        <p>{site.footerLine1}</p>
        <p className="mt-1">
          <span className="text-primary/40">&#9658;</span> {site.footerLine2}
        </p>
      </div>
    </div>
  );
}

function ContactCursor() {
  return (
    <div className="flex items-center gap-1 pt-3" aria-hidden="true">
      <span className="text-primary">$</span>
      <span className="inline-block w-2 h-[1em] bg-primary/70 align-middle animate-pulse ml-1" />
    </div>
  );
}
