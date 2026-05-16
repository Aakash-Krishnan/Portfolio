"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { PortfolioSiteSettings } from "@/types/portfolio";

const ABOUT_HIGHLIGHTS = ["unreasonably fast", "before it's cool", "myself"];

function CountUp({
  target,
  suffix,
  started,
}: {
  target: number;
  suffix: string;
  started: boolean;
}) {
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!started || !numRef.current) return;
    const isDecimal = !Number.isInteger(target);
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => {
        if (numRef.current)
          numRef.current.textContent = isDecimal
            ? obj.val.toFixed(1)
            : Math.round(obj.val).toString();
      },
    });
  }, [started, target]);

  return (
    <span>
      <span ref={numRef}>0</span>
      {suffix}
    </span>
  );
}

export default function About({ site }: { site: PortfolioSiteSettings }) {
  const STATS = site.aboutStats.map((stat) => ({
    value: stat.numericValue ?? (Number.parseFloat(stat.value) || 0),
    suffix: stat.suffix ?? "",
    label: stat.label,
  }));
  const headingLines = site.aboutHeading.split("\n");
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsStarted, setStatsStarted] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        if (prefersReducedMotion) {
          if (headingRef.current)
            gsap.set(headingRef.current, { clipPath: "inset(0 0% 0 0)" });
          if (paraRef.current) gsap.set(paraRef.current, { opacity: 1 });
          const cards = section.querySelectorAll<HTMLElement>(".stat-card");
          gsap.set(cards, { opacity: 1 });
          setStatsStarted(true);
          return;
        }

        // Heading clip-path reveal
        if (headingRef.current) {
          gsap.fromTo(
            headingRef.current,
            { clipPath: "inset(0 100% 0 0)" },
            {
              clipPath: "inset(0 0% 0 0)",
              duration: 0.9,
              ease: "power3.inOut",
            },
          );
        }
        // Para fade up
        if (paraRef.current) {
          gsap.fromTo(
            paraRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.2 },
          );
        }
        // Stat cards + counter
        const cards = section.querySelectorAll<HTMLElement>(".stat-card");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40, rotateX: 15 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "power3.out",
            onComplete: () => setStatsStarted(true),
          },
        );
      },
      { root: document.getElementById("terminal-scroll"), threshold: 0.1 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      aria-labelledby="about-heading"
      className="my-20 py-4 px-6"
      style={{ perspective: "800px" }}
    >
      <div className="max-w-4xl mx-auto">
        <p
          className="font-mono text-primary text-sm mb-4 tracking-wider"
          aria-hidden="true"
        >
          sky.about()
        </p>
        <h2
          id="about-heading"
          ref={headingRef}
          className="text-3xl sm:text-4xl font-bold text-text leading-tight mb-6"
          style={{ clipPath: "inset(0 100% 0 0)" }}
        >
          {headingLines.map((line, i) => {
            const highlight = ABOUT_HIGHLIGHTS[i];
            const parts =
              highlight && line.includes(highlight)
                ? line.split(highlight)
                : [line, ""];
            return (
              <span key={line}>
                {parts[0]}
                {highlight && parts.length > 1 && (
                  <span className="text-primary">{highlight}</span>
                )}
                {parts[1]}
                {i < headingLines.length - 1 && <br />}
              </span>
            );
          })}
        </h2>
        <p
          ref={paraRef}
          className="text-muted text-lg leading-relaxed max-w-2xl opacity-0"
        >
          {site.aboutBio}
        </p>
        <div
          ref={statsRef}
          className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="stat-card opacity-0 bg-surface border border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors duration-300 cursor-default"
            >
              <div className="text-4xl font-bold text-primary font-mono tabular-nums">
                <CountUp
                  target={stat.value}
                  suffix={stat.suffix}
                  started={statsStarted}
                />
              </div>
              <p className="mt-2 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
