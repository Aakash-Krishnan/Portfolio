"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const BOOT_LINES = [
  { text: "$ ./init-sky.sh", type: "cmd" },
  { text: "Checking dependencies...", type: "info" },
  { text: "✓ Performance engineering     [loaded]", type: "success" },
  { text: "✓ AI/LLM tooling              [loaded]", type: "success" },
  { text: "✓ Full-stack ownership        [loaded]", type: "success" },
  { text: "✓ Bundle size obsession       [loaded]", type: "success" },
  { text: "✗ Work-life balance           [404]", type: "error" },
  { text: "Booting Sky v3.0 (3 years in prod)...", type: "info" },
  { text: "✓ System ready.", type: "success" },
];

export default function BootOverlay({ onComplete }: { onComplete: () => void }) {
  const overlayRef   = useRef<HTMLDivElement>(null);
  const terminalRef  = useRef<HTMLDivElement>(null);
  const headerRef    = useRef<HTMLDivElement>(null);
  const bootBodyRef  = useRef<HTMLDivElement>(null);
  const previewRef   = useRef<HTMLDivElement>(null);
  const linesRef     = useRef<(HTMLDivElement | null)[]>([]);
  const cursorRef    = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // 1. Terminal appears
      tl.fromTo(
        terminalRef.current,
        { opacity: 0, y: 40, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" }
      );

      // 2. Boot lines stagger in
      linesRef.current.forEach((line, i) => {
        if (!line) return;
        tl.fromTo(
          line,
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, duration: 0.2, ease: "power1.out" },
          `+=0.${i === 0 ? "3" : "2"}`
        );
      });

      // 3. Cursor blinks
      tl.to(
        cursorRef.current,
        { opacity: 0, repeat: 4, yoyo: true, duration: 0.25, ease: "none" },
        "+=0.3"
      );

      // 4. Boot lines fade out, preview fades in — terminal becomes the hero
      tl.to(bootBodyRef.current, { opacity: 0, duration: 0.35, ease: "power2.in" }, "+=0.2");

      tl.to(
        terminalRef.current,
        { backgroundColor: "var(--color-background)", duration: 0.4, ease: "power2.out" },
        "<"
      );

      tl.fromTo(
        previewRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "-=0.1"
      );

      // 5. Brief pause so user can see the preview content
      tl.to({}, { duration: 0.6 });

      // 6. Header fades out as we prepare to zoom
      tl.to(headerRef.current, { opacity: 0, duration: 0.25, ease: "power2.in" });

      // 7. Terminal zooms to fill the entire screen
      tl.call(() => {
        const el = terminalRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const scale = Math.max(
          window.innerWidth  / rect.width,
          window.innerHeight / rect.height
        ) * 1.1;

        gsap.to(el, {
          scale,
          borderRadius: 0,
          boxShadow: "none",
          borderColor: "transparent",
          duration: 0.8,
          ease: "power3.inOut",
        });
      });

      // 8. Overlay fades out mid-zoom — page content beneath becomes visible
      tl.to(
        overlayRef.current,
        { opacity: 0, duration: 0.4, ease: "power2.in", onComplete },
        "+=0.5"
      );
    });

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      style={{
        background:
          "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(34,197,94,0.04) 0%, #0B1120 70%)",
      }}
    >
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="w-full max-w-xl relative z-10">
        <div
          ref={terminalRef}
          className="opacity-0 rounded-xl overflow-hidden border border-border"
          style={{
            backgroundColor: "var(--color-surface)",
            boxShadow: "0 0 80px rgba(34,197,94,0.07), 0 30px 60px rgba(0,0,0,0.6)",
            transformOrigin: "center center",
          }}
        >
          {/* Titlebar */}
          <div
            ref={headerRef}
            className="flex items-center gap-2 px-4 py-3 border-b border-border"
            style={{ backgroundColor: "rgba(11,17,32,0.6)" }}
          >
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-primary/70" />
            <span className="ml-3 font-mono text-xs text-muted select-none">
              sky@macbook ~ zsh
            </span>
          </div>

          {/* Boot lines — shown during boot, hidden after */}
          <div ref={bootBodyRef} className="p-6 font-mono text-sm space-y-1.5 min-h-[260px]">
            {BOOT_LINES.map((line, i) => (
              <div
                key={i}
                ref={(el) => { linesRef.current[i] = el; }}
                className={`opacity-0 leading-relaxed ${
                  line.type === "cmd"       ? "text-primary"
                  : line.type === "success" ? "text-text"
                  : line.type === "error"   ? "text-red-400"
                  : "text-muted"
                }`}
              >
                {line.text}
              </div>
            ))}
            <div className="flex items-center gap-1 pt-1">
              <span className="text-primary">$</span>
              <span ref={cursorRef} className="inline-block w-2.5 h-[1em] bg-primary align-middle" />
            </div>
          </div>

          {/* Hero preview — shown after boot, zoomed into */}
          <div
            ref={previewRef}
            className="opacity-0 absolute inset-0 top-[49px] px-8 py-10 flex flex-col justify-center"
          >
            <p className="font-mono text-[10px] text-primary tracking-[0.2em] uppercase mb-4">
              Senior Web Developer · Chennai, India
            </p>
            <h1 className="text-2xl font-bold text-text leading-tight">
              Hey, I&apos;m
            </h1>
            <h1 className="text-2xl font-bold text-primary font-mono tracking-tight mt-1">
              Aakash Krishnan S
            </h1>
            <p className="text-muted text-xs leading-relaxed mt-4 max-w-xs">
              I make the web{" "}
              <span className="text-text">unreasonably fast</span>, build{" "}
              <span className="text-text">AI</span> into the stack, and own the
              entire frontend <span className="text-text">myself</span>.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <span className="px-4 py-1.5 bg-primary text-background text-xs font-semibold rounded-lg">
                View Work
              </span>
              <span className="px-4 py-1.5 border border-border text-muted text-xs font-semibold rounded-lg">
                Let&apos;s Talk
              </span>
            </div>
            {/* Subtle grid matching the actual hero bg */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-b-xl overflow-hidden"
              style={{
                backgroundImage:
                  "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
