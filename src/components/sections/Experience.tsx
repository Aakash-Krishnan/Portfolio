"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const EXPERIENCE = [
  {
    hash: "a3f2c1d",
    role: "Senior Web Developer",
    company: "SuperOps.ai",
    period: "Aug 2024 – Present",
    tag: "HEAD → main",
    isHead: true,
    author: "Aakash Krishnan S <s.aakashkrishnan@gmail.com>",
    points: [
      "Sole frontend engineer — own architecture, feature dev, API integration, and AWS deployment",
      "Built AI/LLM-powered internal tooling using Vercel AI SDK, Claude API, and Amazon Bedrock",
      "Reduced JS bundle by 90%, HTML payload by 93% — LCP dropped from ~4s to sub-1.5s",
      "Led full migration to Next.js with SSG/SSR; cut dev compile time by 84% via Turbopack",
      "Architected provider-agnostic AI factory pattern supporting Claude, OpenAI, and Bedrock with zero code changes between providers",
      "Owned CloudFront + S3 deployment pipeline; set up CI/CD via Jenkins for zero-downtime releases",
      "Drove adoption of shadcn/ui and Tailwind v4 across the product — cut CSS authoring time significantly",
      "Runner-up at SuperHack 2023 — internal hackathon",
    ],
  },
  {
    hash: "8b91e4a",
    role: "Project Engineer",
    company: "Wipro Limited",
    period: "May 2022 – Sep 2023",
    tag: "origin/main",
    isHead: false,
    author: "Aakash Krishnan S <s.aakashkrishnan@gmail.com>",
    points: [
      "Built real-time frontend features in a micro-frontend architecture for a large-scale fintech platform",
      "Led a team of 4 engineers — conducted code reviews, sprint planning, and enforced architecture standards",
      "Collaborated with backend and QA teams to deliver features on tight release cycles",
      "Improved component reusability by introducing a shared design system across micro-frontends",
      "Participated in cross-functional discussions to translate product requirements into scalable UI solutions",
    ],
  },
];

function CommitDetail({
  exp,
  isOpen,
}: {
  exp: (typeof EXPERIENCE)[0];
  isOpen: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const linesRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (isOpen) {
      const height = el.scrollHeight;
      gsap.fromTo(el,
        { height: 0, opacity: 0 },
        { height, opacity: 1, duration: 0.4, ease: "power3.out",
          onComplete: () => gsap.set(el, { height: "auto" }) }
      );
      gsap.fromTo(
        linesRef.current.filter(Boolean),
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.25, stagger: 0.06, ease: "power2.out", delay: 0.15 }
      );
    } else {
      gsap.to(el, { height: 0, opacity: 0, duration: 0.3, ease: "power2.in" });
    }
  }, [isOpen]);

  const lines = [
    { text: `commit ${exp.hash}`, color: "text-yellow-400/90" },
    { text: `Author: ${exp.author}`, color: "text-muted" },
    { text: `Date:   ${exp.period}`, color: "text-muted" },
    { text: "", color: "" },
    { text: "diff --git a/career b/career", color: "text-muted/60" },
    { text: "--- a/previous_role", color: "text-red-400/60" },
    { text: "+++ b/current_role", color: "text-primary/70" },
    { text: "", color: "" },
    ...exp.points.map(p => ({ text: `+ ${p}`, color: "text-primary/90" })),
  ];

  return (
    <div ref={ref} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>
      <div className="mt-3 ml-1 font-mono text-sm rounded-lg border border-border/60 bg-background/60 p-5 space-y-1">
        {lines.map((line, i) => (
          <div
            key={i}
            ref={(el) => { linesRef.current[i] = el; }}
            className={`leading-6 ${line.color} ${line.text.startsWith("+") ? "bg-primary/5 px-1 -mx-1 rounded" : ""}`}
          >
            {line.text || " "}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Experience() {
  const sectionRef  = useRef<HTMLElement>(null);
  const lineRef     = useRef<HTMLDivElement>(null);
  const entriesRef  = useRef<(HTMLDivElement | null)[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied]     = useState<string | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (lineRef.current) gsap.set(lineRef.current, { scaleY: 0, transformOrigin: "top center" });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const tl = gsap.timeline();
        tl.to(lineRef.current, { scaleY: 1, duration: 0.7, ease: "power2.out" });
        tl.fromTo(
          entriesRef.current.filter(Boolean),
          { opacity: 0, x: -28 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.2, ease: "power2.out" },
          "-=0.4"
        );
      },
      { root: document.getElementById("terminal-scroll"), threshold: 0.15 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(hash);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <section id="experience" ref={sectionRef} className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="font-mono text-primary text-sm mb-4 tracking-wider">$ git log --work</p>
        <h2 className="text-3xl font-bold text-text mb-12">Experience</h2>

        <div className="relative">
          <div
            ref={lineRef}
            className="absolute left-[5.5rem] top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent"
          />

          <div className="space-y-3">
            {EXPERIENCE.map((exp, i) => (
              <div
                key={exp.hash}
                ref={(el) => { entriesRef.current[i] = el; }}
                className="opacity-0"
              >
                {/* Commit row — clickable */}
                <button
                  onClick={() => setExpanded(prev => prev === exp.hash ? null : exp.hash)}
                  className="w-full flex gap-6 items-start text-left group rounded-xl border border-transparent hover:border-primary/10 hover:bg-primary/[0.03] px-4 py-3 -mx-4 transition-all duration-200 cursor-pointer"
                >
                  {/* Hash */}
                  <div className="shrink-0 w-20 text-right pt-0.5">
                    <span
                      onClick={(e) => { e.stopPropagation(); copyHash(exp.hash); }}
                      title="Copy hash"
                      className="font-mono text-xs text-primary bg-surface border border-border px-2 py-0.5 rounded hover:border-primary/60 hover:bg-primary/10 transition-all duration-200 cursor-pointer inline-flex items-center gap-1"
                    >
                      {copied === exp.hash ? "✓ ok" : exp.hash}
                    </span>
                  </div>

                  {/* Branch dot */}
                  <div className="relative shrink-0 flex items-center pt-1.5">
                    {exp.isHead ? (
                      <span className="relative flex w-3 h-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40" />
                        <span className="relative w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                      </span>
                    ) : (
                      <span className="w-3 h-3 rounded-full border-2 border-primary/30 bg-surface ring-4 ring-background" />
                    )}
                  </div>

                  {/* Summary */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-text font-semibold text-lg group-hover:text-primary transition-colors duration-200">
                        {exp.role}
                      </span>
                      <span className="font-mono text-base text-primary/70">@ {exp.company}</span>
                      <span className={`ml-auto font-mono text-xs px-2 py-0.5 rounded border inline-flex items-center gap-1.5 ${
                        exp.isHead
                          ? "border-primary/40 text-primary bg-primary/5"
                          : "border-cyan-500/30 text-cyan-400/80 bg-cyan-500/5"
                      }`}>
                        {exp.isHead && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                        {exp.tag}
                      </span>
                      <span className="text-muted/40 font-mono text-xs ml-1">
                        {expanded === exp.hash ? "▾" : "▸"}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-muted/60 mt-0.5">{exp.period}</p>
                  </div>
                </button>

                {/* Expandable diff */}
                <div className="ml-[6.5rem]">
                  <CommitDetail exp={exp} isOpen={expanded === exp.hash} />
                </div>
              </div>
            ))}
          </div>

          {/* End of log */}
          <div className="mt-8 ml-[6.5rem] font-mono text-xs text-muted/30 flex items-center gap-2">
            <span className="text-primary/30">$</span>
            <span>end of log — 2 commits</span>
            <span className="inline-block w-2 h-3.5 bg-muted/20 animate-pulse ml-0.5" />
          </div>
        </div>
      </div>
    </section>
  );
}
