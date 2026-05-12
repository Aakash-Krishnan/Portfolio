"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const MARQUEE_ITEMS = [
  "React.js", "Next.js", "TypeScript", "Tailwind CSS", "GSAP",
  "Vercel AI SDK", "Claude API", "Amazon Bedrock", "AWS", "GraphQL",
  "Node.js", "shadcn/ui", "Turbopack", "OpenNext", "Redux",
];

const STATS = [
  { value: "3+",    label: "Years in prod" },
  { value: "90%",   label: "Bundle reduced" },
  { value: "<1.5s", label: "LCP achieved" },
  { value: "1",     label: "Sole frontend eng" },
];

export default function Hero() {
  const introRef     = useRef<HTMLDivElement>(null);
  const ctaRef       = useRef<HTMLDivElement>(null);
  const statsRef     = useRef<HTMLDivElement>(null);
  const nameRef      = useRef<HTMLSpanElement>(null);
  const [paused, setPaused] = useState(false);

  // Entrance — staggered sections fade up
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });

      tl.fromTo(
        ".hero-line",
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.12, ease: "power3.out" }
      );
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
        "-=0.2"
      );
      tl.fromTo(
        statsRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
        "-=0.2"
      );
    });

    return () => ctx.revert();
  }, []);

  // Typewriter cycle: "Aakash Krishnan S" ↔ "Sky"
  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;

    // Skip on mobile — show static name only
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    const names = ["Aakash Krishnan S", "Sky"];
    let nameIndex  = 0;
    let charIndex  = 0;
    let isDeleting = false;
    let timerId: ReturnType<typeof setTimeout>;

    const TYPE_SPEED        = 75;
    const DELETE_SPEED      = 40;
    const HOLD_AFTER_TYPE   = 2200;
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
          nameIndex  = (nameIndex + 1) % names.length;
          timerId    = setTimeout(tick, HOLD_AFTER_DELETE);
          return;
        }
        timerId = setTimeout(tick, DELETE_SPEED);
      }
    };

    const startDelay = setTimeout(() => { el.textContent = ""; tick(); }, 500);
    return () => { clearTimeout(startDelay); clearTimeout(timerId); };
  }, []);

  // Magnetic buttons
  useEffect(() => {
    const buttons  = document.querySelectorAll<HTMLElement>("[data-magnetic]");
    const cleanups: (() => void)[] = [];

    buttons.forEach((btn) => {
      const onMove  = (e: MouseEvent) => {
        const r  = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width  / 2)) * 0.35;
        const dy = (e.clientY - (r.top  + r.height / 2)) * 0.35;
        gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: "power2.out" });
      };
      const onLeave = () =>
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
      const onEnter = () =>
        gsap.to(btn, { scale: 1.06, duration: 0.2, ease: "power2.out" });

      btn.addEventListener("mousemove",  onMove);
      btn.addEventListener("mouseleave", onLeave);
      btn.addEventListener("mouseenter", onEnter);
      cleanups.push(() => {
        btn.removeEventListener("mousemove",  onMove);
        btn.removeEventListener("mouseleave", onLeave);
        btn.removeEventListener("mouseenter", onEnter);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24 relative overflow-hidden"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial glow — top left to complement left-aligned text */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 20% 50%, rgba(34,197,94,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Main content — left aligned */}
      <div className="relative z-10 max-w-5xl w-full">

        {/* Label */}
        <p className="hero-line opacity-0 font-mono text-sm text-primary tracking-[0.2em] uppercase mb-6">
          AI-first Fullstack Developer · Chennai, India
        </p>

        {/* "Hey, I'm" */}
        <h1 className="hero-line opacity-0 text-5xl sm:text-6xl lg:text-7xl font-bold text-text tracking-tight leading-none mb-0">
          Hey, I&apos;m
        </h1>

        {/* Typewriter name — fixed height so layout never shifts */}
        <div className="hero-line opacity-0 h-14 sm:h-18 lg:h-20 flex items-center">
          <span
            ref={nameRef}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary font-mono tracking-tighter leading-none"
          >
            Aakash Krishnan S
          </span>
          <span className="hidden md:inline-block w-[2px] h-10 sm:h-14 lg:h-18 bg-primary/40 ml-2 cursor-blink" />
        </div>

        {/* Tagline */}
        <p className="hero-line opacity-0 mt-8 text-muted text-lg sm:text-xl max-w-xl leading-relaxed">
          I make the web <span className="text-text font-medium">unreasonably fast</span>,
          build <span className="text-text font-medium">AI</span> into the stack,
          and own the entire frontend <span className="text-text font-medium">myself</span>.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="opacity-0 mt-10 flex flex-wrap items-center gap-4">
          <a
            href="#projects"
            data-magnetic
            className="px-8 py-3 bg-primary text-background font-semibold rounded-lg text-sm hover:bg-primary-hover transition-colors duration-200 inline-block"
          >
            View Work
          </a>
          <a
            href="#contact"
            data-magnetic
            className="px-8 py-3 border border-border text-muted font-semibold rounded-lg text-sm hover:border-primary hover:text-primary transition-colors duration-200 inline-block"
          >
            Let&apos;s Talk
          </a>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-muted hover:text-primary transition-colors duration-200 underline underline-offset-4"
          >
            Resume ↗
          </a>
        </div>

        {/* Stats row */}
        <div
          ref={statsRef}
          className="opacity-0 mt-14 flex flex-wrap gap-x-10 gap-y-4"
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-2xl sm:text-3xl font-bold text-primary font-mono">{s.value}</p>
              <p className="text-xs text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scrolling tech marquee — pinned to bottom of section */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="w-full h-px bg-border" />

        <div
          className="relative overflow-hidden py-5"
          style={{ backgroundColor: "rgba(17,24,39,0.7)" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Edge fades */}
          <div
            className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, var(--color-background), transparent)" }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, var(--color-background), transparent)" }}
          />

          <div
            className="flex gap-4 whitespace-nowrap"
            style={{
              animation: "marquee 32s linear infinite",
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span
                key={i}
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
        </div>
      </div>

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

        /* Gradient is fixed to the viewport — cards scroll through it,
           picking up whichever color sits at their current screen position */
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
    </section>
  );
}
