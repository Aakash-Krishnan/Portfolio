"use client";

import { useEffect, useMemo, useRef } from "react";
import { loadGsap } from "@/lib/gsap";
import type {
  PortfolioSiteSettings,
  PortfolioSkillCategory,
  SkillCategoryTheme,
} from "@/types/portfolio";

interface Seg {
  text: string;
  cls: string;
  tooltip?: string;
}

const M = "text-muted/50";
const K = "text-sky-300/80";
const S = "text-amber-300/80";
const B0 = "text-yellow-300/90";  // outer brace level
const B1 = "text-fuchsia-400/80"; // inner brace level

const THEME_HEADER: Record<SkillCategoryTheme, string> = {
  PRIMARY: "text-primary",
  CYAN: "text-cyan-400",
  ORANGE: "text-orange-400",
  YELLOW: "text-yellow-400",
  PURPLE: "text-purple-400",
};

const THEME_VALUE: Record<SkillCategoryTheme, string> = {
  PRIMARY: "text-primary/70",
  CYAN: "text-cyan-400/70",
  ORANGE: "text-orange-400/70",
  YELLOW: "text-yellow-400/70",
  PURPLE: "text-purple-400/70",
};

function s(text: string, cls: string): Seg {
  return { text, cls };
}

function skillLines(
  skills: { name: string; version: string }[],
  valCls: string,
): Seg[][] {
  return skills.map(({ name, version }) => [
    s(`    "${name}"`, K),
    s(": ", M),
    s(`"${version}"`, valCls),
    s(",", M),
  ]);
}

function getVersion(): string {
  const now = new Date();

  function monthsBetween(start: Date, end: Date) {
    return (
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth())
    );
  }

  const wipro = monthsBetween(new Date("2022-05-01"), new Date("2023-09-30"));
  const superops = monthsBetween(new Date("2024-08-01"), now);

  const total = wipro + superops;
  const years = Math.floor(total / 12);
  const months = total % 12;
  const days = now.getDate();
  return `${years}.${months}.${days}`;
}

function buildLines(
  site: PortfolioSiteSettings,
  categories: PortfolioSkillCategory[],
): Seg[][] {
  const lines: Seg[][] = [
    [s("{", B0)],
    [s('  "name"', K), s(": ", M), s(`"${site.packageName}"`, S), s(",", M)],
    [
      s('  "version"', K),
      s(": ", M),
      { text: `"${getVersion()}"`, cls: S, tooltip: site.versionTooltip },
      s(",", M),
    ],
    [s('  "role"', K), s(": ", M), s(`"${site.packageRole}"`, S), s(",", M)],
    [],
  ];

  for (let ci = 0; ci < categories.length; ci++) {
    const category = categories[ci];
    const headerCls = THEME_HEADER[category.theme];
    const valueCls = THEME_VALUE[category.theme];
    const isLast = ci === categories.length - 1;
    lines.push(
      [s(`  "${category.displayLabel}"`, headerCls), s(": ", M), s("{", B1)],
      ...skillLines(
        category.skills.map((sk) => ({ name: sk.name, version: sk.version })),
        valueCls,
      ),
      [s("  ", M), s("}", B1), s(",", M)],
      ...(isLast ? [] : [[]]),
    );
  }

  lines.push([s("}", B0)]);
  return lines;
}

export default function Skills({
  site,
  categories,
}: {
  site: PortfolioSiteSettings;
  categories: PortfolioSkillCategory[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const linesRef = useRef<(HTMLDivElement | null)[]>([]);
  const LINES = useMemo(() => buildLines(site, categories), [site, categories]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const els = linesRef.current.filter(Boolean) as HTMLDivElement[];
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let observer: IntersectionObserver | undefined;
    loadGsap().then((gsap) => {
      if (!prefersReducedMotion) gsap.set(els, { opacity: 0, x: -10 });

      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer!.disconnect();
          if (prefersReducedMotion) {
            gsap.set(els, { opacity: 1, x: 0 });
            return;
          }
          gsap.to(els, {
            opacity: 1,
            x: 0,
            duration: 0.18,
            stagger: 0.022,
            ease: "power2.out",
          });
        },
        { root: document.getElementById("terminal-scroll"), threshold: 0.08 },
      );
      observer.observe(section);
    });
    return () => observer?.disconnect();
  }, [LINES]);

  return (
    <section
      id="skills"
      ref={sectionRef}
      aria-labelledby="skills-heading"
      className="my-20 py-4 px-6 bg-surface/30"
    >
      <div className="max-w-5xl mx-auto">
        <p
          className="font-mono text-primary text-sm mb-4 tracking-wider"
          aria-hidden="true"
        >
          $ cat package.json
        </p>
        <h2 id="skills-heading" className="text-3xl font-bold text-text mb-8">
          Skills
        </h2>

        <SkillsPanel lines={LINES} linesRef={linesRef} />
      </div>
    </section>
  );
}

function SkillsPanel({
  lines,
  linesRef,
}: {
  lines: Seg[][];
  linesRef: React.MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  return (
    <div
      className="font-mono text-sm rounded-xl border border-border"
      role="img"
      aria-label="Skills listed as a package.json file"
    >
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b border-border rounded-t-xl bg-surface/80 backdrop-blur-sm"
        aria-hidden="true"
      >
        <span className="w-3 h-3 rounded-full bg-red-500/60" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <span className="w-3 h-3 rounded-full bg-primary/60" />
        <span className="ml-3 text-xs text-muted/50 select-none">
          package.json
        </span>
      </div>
      <div className="p-5 bg-background/60 overflow-x-auto rounded-b-xl">
        {lines.map((segs, i) => (
          <div
            key={i}
            ref={(el) => {
              linesRef.current[i] = el;
            }}
            className="flex min-h-[1.6rem] items-baseline"
          >
            <span className="text-muted/25 select-none w-8 text-right pr-4 shrink-0 text-xs leading-[1.6rem]">
              {i + 1}
            </span>
            <span className="leading-[1.6rem] whitespace-pre">
              {segs.map((sg, j) =>
                sg.tooltip ? (
                  <span key={j} className="relative group/tip">
                    <span
                      className={`${sg.cls} underline decoration-dashed decoration-muted/40 underline-offset-2 cursor-default`}
                    >
                      {sg.text}
                    </span>
                    <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap rounded-md bg-surface border border-border px-2.5 py-1.5 text-xs text-muted opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-10">
                      {sg.tooltip}
                    </span>
                  </span>
                ) : (
                  <span key={j} className={sg.cls}>
                    {sg.text}
                  </span>
                ),
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
