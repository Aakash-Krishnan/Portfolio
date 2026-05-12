"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface Seg { text: string; cls: string; tooltip?: string }

function getVersion(): string {
  const now = new Date();

  function monthsBetween(start: Date, end: Date) {
    return (end.getFullYear() - start.getFullYear()) * 12 +
           (end.getMonth()   - start.getMonth());
  }

  // Active working periods only — gap excluded
  const wipro    = monthsBetween(new Date("2022-05-01"), new Date("2023-09-30"));
  const superops = monthsBetween(new Date("2024-08-01"), now);

  const total  = wipro + superops;
  const years  = Math.floor(total / 12);
  const months = total % 12;
  const days   = now.getDate();
  return `${years}.${months}.${days}`;
}

const M  = "text-muted/50";
const K  = "text-sky-300/80";
const S  = "text-amber-300/80";

function s(text: string, cls: string): Seg { return { text, cls }; }

function skillLines(
  skills: { name: string; ver: string }[],
  valCls: string,
): Seg[][] {
  return skills.map(({ name, ver }) => [
    s(`    "${name}"`, K),
    s(": ", M),
    s(`"${ver}"`, valCls),
    s(",", M),
  ]);
}

const LINES: Seg[][] = [
  [s("{", M)],
  [s('  "name"', K),    s(": ", M), s('"aakash-krishnan"', S),             s(",", M)],
  [s('  "version"', K), s(": ", M), { text: `"${getVersion()}"`, cls: S, tooltip: "years.months.days" }, s(",", M)],
  [s('  "role"', K),    s(": ", M), s('"AI-first Fullstack Developer"', S),     s(",", M)],
  [],
  [s('  "dependencies"', "text-primary"), s(": {", M)],
  ...skillLines([
    { name: "react",        ver: "^5yr" },
    { name: "next.js",      ver: "^2yr" },
    { name: "typescript",   ver: "^3yr" },
    { name: "tailwind-css", ver: "^3yr" },
    { name: "gsap",         ver: "^2yr" },
    { name: "shadcn-ui",    ver: "^1yr" },
    { name: "scss",         ver: "^3yr" },
  ], "text-primary/70"),
  [s("  },", M)],
  [],
  [s('  "aiDependencies"', "text-cyan-400"), s(": {", M)],
  ...skillLines([
    { name: "vercel-ai-sdk",  ver: "^1yr" },
    { name: "claude-api",     ver: "^1yr" },
    { name: "amazon-bedrock", ver: "^1yr" },
    { name: "openai-api",     ver: "^1yr" },
    { name: "graphql",        ver: "^2yr" },
    { name: "rest-apis",      ver: "^4yr" },
  ], "text-cyan-400/70"),
  [s("  },", M)],
  [],
  [s('  "backend"', "text-orange-400"), s(": {", M)],
  ...skillLines([
    { name: "node.js",    ver: "^3yr" },
    { name: "express.js", ver: "^2yr" },
    { name: "sql",        ver: "^3yr" },
    { name: "postgresql", ver: "^2yr" },
    { name: "mongodb",    ver: "^2yr" },
    { name: "redis",      ver: "^1yr" },
  ], "text-orange-400/70"),
  [s("  },", M)],
  [],
  [s('  "devDependencies"', "text-yellow-400"), s(": {", M)],
  ...skillLines([
    { name: "aws-s3",      ver: "^2yr" },
    { name: "cloudfront",  ver: "^2yr" },
    { name: "lambda",      ver: "^1yr" },
    { name: "jenkins-ci",  ver: "^2yr" },
    { name: "turbopack",   ver: "^1yr" },
    { name: "opennext",    ver: "^1yr" },
  ], "text-yellow-400/70"),
  [s("  },", M)],
  [],
  [s('  "tools"', "text-purple-400"), s(": {", M)],
  ...skillLines([
    { name: "figma",          ver: "^3yr" },
    { name: "git",            ver: "^5yr" },
    { name: "chrome-devtools",ver: "^5yr" },
    { name: "cursor",         ver: "^1yr" },
    { name: "claude-code",    ver: "^1yr" },
    { name: "webpack",        ver: "^3yr" },
  ], "text-purple-400/70"),
  [s("  }", M)],
  [],
  [s("}", M)],
];

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const linesRef   = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const els = linesRef.current.filter(Boolean) as HTMLDivElement[];
    gsap.set(els, { opacity: 0, x: -10 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
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
    return () => observer.disconnect();
  }, []);

  return (
    <section id="skills" ref={sectionRef} className="py-28 px-6 bg-surface/30">
      <div className="max-w-5xl mx-auto">
        <p className="font-mono text-primary text-sm mb-4 tracking-wider">$ cat package.json</p>
        <h2 className="text-3xl font-bold text-text mb-8">Skills</h2>

        <div className="font-mono text-sm rounded-xl border border-border">
          {/* fake window chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border rounded-t-xl bg-surface/80 backdrop-blur-sm">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-primary/60" />
            <span className="ml-3 text-xs text-muted/50 select-none">package.json</span>
          </div>

          {/* code body */}
          <div className="p-5 bg-background/60 overflow-x-auto rounded-b-xl">
            {LINES.map((segs, i) => (
              <div
                key={i}
                ref={(el) => { linesRef.current[i] = el; }}
                className="flex min-h-[1.6rem] items-baseline"
              >
                <span className="text-muted/25 select-none w-8 text-right pr-4 shrink-0 text-xs leading-[1.6rem]">
                  {i + 1}
                </span>
                <span className="leading-[1.6rem]">
                  {segs.map((sg, j) =>
                    sg.tooltip ? (
                      <span key={j} className="relative group/tip">
                        <span className={`${sg.cls} underline decoration-dashed decoration-muted/40 underline-offset-2 cursor-default`}>{sg.text}</span>
                        <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap rounded-md bg-surface border border-border px-2.5 py-1.5 text-xs text-muted opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-10">
                          {sg.tooltip}
                        </span>
                      </span>
                    ) : (
                      <span key={j} className={sg.cls}>{sg.text}</span>
                    )
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
