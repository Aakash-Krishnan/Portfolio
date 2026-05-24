"use client";

import { useEffect, useRef, useState } from "react";
import { loadGsap } from "@/lib/gsap";
import type { ResumeLink } from "@/lib/resume";
import type { PortfolioSiteSettings } from "@/types/portfolio";

export default function Hero({
  site,
  resume,
}: {
  site: PortfolioSiteSettings;
  resume: ResumeLink | null;
}) {
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const [paused, setPaused] = useState(false);

  const stats = site.heroStats;
  const marqueeItems = site.marqueeItems;
  const typewriterNames = site.typewriterNames;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      document.querySelectorAll<HTMLElement>(".hero-line").forEach((el) => {
        el.style.opacity = "1";
      });
      if (ctaRef.current) ctaRef.current.style.opacity = "1";
      if (statsRef.current) statsRef.current.style.opacity = "1";
      return;
    }

    let ctx: { revert: () => void } | undefined;
    loadGsap().then((gsap) => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ delay: 0.15 });
        tl.fromTo(
          ".hero-line",
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.12, ease: "power3.out" },
        );
        tl.fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
          "-=0.2",
        );
        tl.fromTo(
          statsRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
          "-=0.2",
        );
      });
    });

    return () => ctx?.revert();
  }, []);

  useEffect(() => {
    const el = nameRef.current;
    if (!el || typewriterNames.length === 0) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    const names = typewriterNames;
    let nameIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timerId: ReturnType<typeof setTimeout>;

    const TYPE_SPEED = 75;
    const DELETE_SPEED = 40;
    const HOLD_AFTER_TYPE = 2200;
    const HOLD_AFTER_DELETE = 280;

    const tick = () => {
      const current = names[nameIndex];

      if (!isDeleting) {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          isDeleting = true;
          timerId = setTimeout(tick, HOLD_AFTER_TYPE);
          return;
        }
        timerId = setTimeout(tick, TYPE_SPEED);
      } else {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          isDeleting = false;
          nameIndex = (nameIndex + 1) % names.length;
          timerId = setTimeout(tick, HOLD_AFTER_DELETE);
          return;
        }
        timerId = setTimeout(tick, DELETE_SPEED);
      }
    };

    const startDelay = setTimeout(() => {
      el.textContent = "";
      tick();
    }, 500);
    return () => {
      clearTimeout(startDelay);
      clearTimeout(timerId);
    };
  }, [typewriterNames]);

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="min-h-screen flex flex-col justify-center max-md:justify-between max-md:pt-20 max-md:pb-4 px-8 md:px-16 lg:px-24 relative overflow-hidden"
    >
      <MotionGrid />
      <MotionGlow />

      <div className="relative z-10 max-w-5xl w-full">
        <p className="hero-line opacity-0 font-mono text-sm text-primary tracking-[0.2em] uppercase mb-6">
          {site.heroLabel}
        </p>

        <h1 id="hero-heading" className="sr-only">
          {site.fullName} — {site.packageRole}
        </h1>

        <p
          className="hero-line opacity-0 text-4xl sm:text-6xl lg:text-7xl font-bold text-text tracking-tight leading-none mb-1"
          aria-hidden="true"
        >
          Hey, I&apos;m
        </p>

        <MotionName nameRef={nameRef} fullName={site.fullName} />

        <p className="hero-line opacity-0 mt-8 text-muted text-lg sm:text-xl max-w-xl leading-relaxed">
          {site.heroTagline}
        </p>

        <MotionCtas ctaRef={ctaRef} resume={resume} />
        <MotionStats statsRef={statsRef} stats={stats} />
      </div>

      <MotionMarquee items={marqueeItems} paused={paused} setPaused={setPaused} />
      <MotionStyles />
    </section>
  );
}

function MotionGrid() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 opacity-[0.03] pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />
  );
}

function MotionGlow() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse 55% 60% at 20% 50%, rgba(34,197,94,0.07) 0%, transparent 70%)",
      }}
    />
  );
}

function MotionName({
  nameRef,
  fullName,
}: {
  nameRef: React.RefObject<HTMLSpanElement | null>;
  fullName: string;
}) {
  return (
    <div className="hero-line opacity-0 sm:h-18 lg:h-20 flex items-center" aria-hidden="true">
      <span
        ref={nameRef}
        className="text-4xl sm:text-6xl lg:text-7xl font-bold text-primary font-mono tracking-tighter leading-tight"
      >
        {fullName}
      </span>
      <span
        className="hidden md:inline-block w-[2px] h-10 sm:h-14 lg:h-18 bg-primary/40 ml-2 cursor-blink"
        aria-hidden="true"
      />
    </div>
  );
}

function MotionCtas({
  ctaRef,
  resume,
}: {
  ctaRef: React.RefObject<HTMLDivElement | null>;
  resume: ResumeLink | null;
}) {
  return (
    <div ref={ctaRef} className="opacity-0 mt-10 flex flex-wrap items-center gap-4">
      <a
        href="#projects"
        className="px-8 py-3 bg-primary text-background font-semibold rounded-lg text-sm hover:bg-primary-hover transition-colors duration-200 inline-block"
      >
        View Work
      </a>
      <a
        href="#contact"
        className="px-8 py-3 border border-border text-muted font-semibold rounded-lg text-sm hover:border-primary hover:text-primary transition-colors duration-200 inline-block"
      >
        Let&apos;s Talk
      </a>
      {resume && (
        <a
          href={resume.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm text-muted hover:text-primary transition-colors duration-200 underline underline-offset-4"
        >
          Resume<span aria-hidden="true"> ↗</span>
          <span className="sr-only">(opens {resume.fileName} in a new tab)</span>
        </a>
      )}
    </div>
  );
}

function MotionStats({
  statsRef,
  stats,
}: {
  statsRef: React.RefObject<HTMLDivElement | null>;
  stats: PortfolioSiteSettings["heroStats"];
}) {
  return (
    <div ref={statsRef} className="opacity-0 mt-14 flex flex-wrap gap-x-10 gap-y-4">
      {stats.map((s) => (
        <MotionStat key={s.label} stat={s} />
      ))}
    </div>
  );
}

function MotionStat({ stat }: { stat: PortfolioSiteSettings["heroStats"][number] }) {
  const display = stat.suffix ? `${stat.value}${stat.suffix}` : stat.value;
  return (
    <div>
      <p className="text-2xl sm:text-3xl font-bold text-primary font-mono" aria-label={`${display} ${stat.label}`}>
        {display}
      </p>
      <p className="text-xs text-muted mt-0.5" aria-hidden="true">
        {stat.label}
      </p>
    </div>
  );
}

function MotionMarquee({
  items,
  paused,
  setPaused,
}: {
  items: string[];
  paused: boolean;
  setPaused: (v: boolean) => void;
}) {
  return (
    <div
      className="relative mt-12 w-full shrink-0 md:absolute md:bottom-0 md:left-0 md:right-0 md:mt-0"
      aria-hidden="true"
    >
      <div className="w-full h-px bg-border" />
      <div
        className="relative overflow-hidden py-5"
        style={{ backgroundColor: "rgba(17,24,39,0.7)" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, var(--color-background), transparent)" }}
        />
        <MotionMarqueeFade />
        <MotionMarqueeTrack items={items} paused={paused} />
      </div>
    </div>
  );
}

function MotionMarqueeFade() {
  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
      style={{ background: "linear-gradient(to left, var(--color-background), transparent)" }}
    />
  );
}

function MotionMarqueeTrack({ items, paused }: { items: string[]; paused: boolean }) {
  return (
    <div
      className="flex gap-4 whitespace-nowrap"
      style={{
        animation: "marquee 32s linear infinite",
        animationPlayState: paused ? "paused" : "running",
      }}
    >
      {[...items, ...items].map((item, i) => (
        <span
          key={`${item}-${i}`}
          className="marquee-card shrink-0 inline-flex items-center px-5 py-2.5 rounded-lg font-mono text-sm font-medium border border-border cursor-default select-none"
          style={{
            backgroundColor: "var(--color-surface)",
            transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = "rgba(34,197,94,0.5)";
            el.style.transform = "translateY(-3px) scale(1.05)";
            el.style.boxShadow = "0 8px 24px rgba(34,197,94,0.12)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.borderColor = "";
            el.style.transform = "";
            el.style.boxShadow = "";
          }}
        >
          <span className="gradient-text">{item}</span>
        </span>
      ))}
    </div>
  );
}

function MotionStyles() {
  return (
    <style>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .cursor-blink { animation: cursor-blink 1.2s ease-in-out infinite; }

        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .cursor-blink { animation: none; }
          [style*="animation: marquee"] { animation-play-state: paused !important; }
        }

        .gradient-text {
          background: linear-gradient(
            90deg,
            #22C55E  0%,
            #86EFAC 20%,
            #06B6D4 40%,
            #818CF8 60%,
            #86EFAC 80%,
            #22C55E 100%
          );
          background-size: 100vw 100%;
          background-attachment: fixed;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
      `}</style>
  );
}
