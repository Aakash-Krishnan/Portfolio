"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ResumeLink } from "@/lib/resume";
import type { PortfolioNavLink } from "@/types/portfolio";

gsap.registerPlugin(ScrollTrigger);

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

type Phase = "booting" | "revealing" | "expanding" | "ready";

export default function TerminalWrapper({
  children,
  navLinks,
  resume,
}: {
  children: React.ReactNode;
  navLinks: PortfolioNavLink[];
  resume: ResumeLink | null;
}) {
  const terminalRef      = useRef<HTMLDivElement>(null);
  const bootRef          = useRef<HTMLDivElement>(null);
  const contentRef       = useRef<HTMLDivElement>(null);
  const cursorRef        = useRef<HTMLSpanElement>(null);
  const trafficLightsRef = useRef<HTMLDivElement>(null);
  const labelRef         = useRef<HTMLSpanElement>(null);
  const linesRef         = useRef<(HTMLDivElement | null)[]>([]);
  const titlebarRef      = useRef<HTMLDivElement>(null);
  const navRef           = useRef<HTMLDivElement>(null);
  const drawerRef        = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("booting");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close drawer on Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    const el = terminalRef.current;
    if (!el) return;

    // Skip boot animation if user prefers reduced motion — jump straight to ready
    if (prefersReducedMotion) {
      gsap.set(el, {
        xPercent: 0, yPercent: 0, top: 0, left: 0,
        width: "100vw", height: "100vh", borderRadius: 0,
        borderColor: "transparent", opacity: 1,
      });
      if (contentRef.current) gsap.set(contentRef.current, { opacity: 1, height: "calc(100vh - 72px)" });
      if (titlebarRef.current) gsap.set(titlebarRef.current, { height: 72 });
      requestAnimationFrame(() => {
        setPhase("ready");
        ScrollTrigger.refresh();
        const scroller = document.getElementById("terminal-scroll");
        if (scroller) scroller.dataset.ready = "true";
        window.dispatchEvent(new CustomEvent("terminal-ready"));
      });
      return;
    }

    gsap.set(el, {
      xPercent: -50,
      yPercent: -50,
      top: "50%",
      left: "50%",
      width: Math.min(window.innerWidth * 0.88, 560),
      borderRadius: 12,
    });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // 1. Terminal fades in small and centered
      tl.to(el, { opacity: 1, duration: 0.6, ease: "power3.out" });

      // 2. Boot lines stagger in
      linesRef.current.forEach((line, i) => {
        if (!line) return;
        tl.fromTo(line,
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, duration: 0.2, ease: "power1.out" },
          `+=0.${i === 0 ? "3" : "2"}`
        );
      });

      // 3. Cursor blinks
      tl.to(cursorRef.current,
        { opacity: 0, repeat: 4, yoyo: true, duration: 0.25, ease: "none" },
        "+=0.3"
      );

      // 4. Boot content scrolls up while terminal grows to preview height
      tl.to(bootRef.current,
        { y: -50, opacity: 0, duration: 0.45, ease: "power2.in" },
        "+=0.2"
      );
      tl.to(el,
        { height: 360, duration: 0.4, ease: "power2.out" },
        "<"
      );

      // 5. Switch to revealing — content div mounts
      tl.call(() => setPhase("revealing"));

      // 6. Pause: let React render + content fade-in animation (handled in useEffect) play out
      tl.to({}, { duration: 1.1 });

      // 7. Expand terminal to fullscreen
      tl.to(el, {
        top: 0,
        left: 0,
        xPercent: 0,
        yPercent: 0,
        width: "100vw",
        height: "100vh",
        borderRadius: 0,
        borderColor: "transparent",
        duration: 0.85,
        ease: "power3.inOut",
        onStart: () => {
          setPhase("expanding");
          gsap.to(trafficLightsRef.current, {
            x: -60, opacity: 0, duration: 0.4, ease: "power2.in",
          });
          gsap.to(labelRef.current, {
            x: -52, fontSize: "0.875rem", duration: 0.85, ease: "power3.inOut",
          });
          gsap.to(titlebarRef.current, {
            height: 72, duration: 0.85, ease: "power3.inOut",
          });
          gsap.to(contentRef.current, {
            height: "calc(100vh - 72px)",
            scale: 1,
            width: "100vw",
            transformOrigin: "top left",
            duration: 0.85,
            ease: "power3.inOut",
          });
        },
        onComplete: () => {
          setPhase("ready");
          gsap.set(contentRef.current, { clearProps: "scale,width,transformOrigin" });
          requestAnimationFrame(() => {
            ScrollTrigger.refresh();
            const scroller = document.getElementById("terminal-scroll");
            if (scroller) scroller.dataset.ready = "true";
            window.dispatchEvent(new CustomEvent("terminal-ready"));
          });
        },
      });
    });

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // Fade content in once it mounts during "revealing"
  useEffect(() => {
    if (phase !== "revealing" || !contentRef.current || prefersReducedMotion) return;
    const terminalWidth = Math.min(window.innerWidth * 0.88, 560);
    const previewScale = terminalWidth / window.innerWidth;
    // Set content to full viewport width so scaling fills the terminal exactly
    gsap.set(contentRef.current, { width: "100vw", transformOrigin: "top left" });
    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 24, scale: previewScale },
      { opacity: 1, y: 0,  scale: previewScale, duration: 0.55, ease: "power2.out", delay: 0.1 }
    );
  }, [phase, prefersReducedMotion]);

  // Nav stagger after expansion
  useEffect(() => {
    if (phase !== "ready" || !navRef.current || prefersReducedMotion) return;
    const items = navRef.current.children;
    gsap.fromTo(items,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power2.out", delay: 0.1 }
    );
  }, [phase, prefersReducedMotion]);

  // Focus first drawer link when opened
  useEffect(() => {
    if (!menuOpen || !drawerRef.current) return;
    const firstLink = drawerRef.current.querySelector<HTMLElement>("a, button");
    firstLink?.focus();
  }, [menuOpen]);

  return (
    <>
      {/* Dark bg visible while terminal is small */}
      {phase === "booting" && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[98]"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(34,197,94,0.04) 0%, #0B1120 70%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>
      )}

      <div
        ref={terminalRef}
        className="fixed z-[100] overflow-hidden border border-border"
        style={{
          opacity: 0,
          backgroundColor: "var(--color-background)",
          boxShadow: phase === "booting" || phase === "revealing"
            ? "0 0 80px rgba(34,197,94,0.08), 0 30px 60px rgba(0,0,0,0.6)"
            : "none",
        }}
      >
        {/* Titlebar — acts as the site header/nav */}
        <div
          ref={titlebarRef}
          className="flex items-center gap-2 px-4 shrink-0 border-b border-border"
          style={{ height: 44, backgroundColor: "rgba(17,24,39,0.9)", backdropFilter: "blur(8px)" }}
        >
          <div ref={trafficLightsRef} className="flex items-center gap-2" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-red-500/70 cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70 cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-primary/70 cursor-pointer" />
          </div>
          <span ref={labelRef} className="ml-3 font-mono text-muted select-none" aria-hidden="true">
            sky@macbook — zsh
          </span>

          {phase === "ready" && !isMobile && (
            <nav ref={navRef} aria-label="Site navigation" className="ml-auto flex items-center gap-5 pr-2" style={{ fontSize: "0.875rem" }}>
              {navLinks.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="font-mono text-muted hover:text-primary transition-colors duration-200"
                >
                  {label}
                </a>
              ))}
              {resume && (
                <a
                  href={resume.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono px-3 py-1 border border-primary/50 text-primary rounded hover:bg-primary hover:text-background transition-colors duration-200"
                >
                  Resume
                  <span className="sr-only">(opens {resume.fileName} in a new tab)</span>
                </a>
              )}
            </nav>
          )}

          {phase === "ready" && isMobile && (
            <button
              className="ml-auto mr-2 flex flex-col justify-center items-center gap-1.5 w-8 h-8 text-muted hover:text-primary transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-drawer"
            >
              <span className={`block h-px w-5 bg-current transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} aria-hidden="true" />
              <span className={`block h-px w-5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} aria-hidden="true" />
              <span className={`block h-px w-5 bg-current transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 translate-y-[-7px]" : ""}`} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Boot sequence — decorative, aria-hidden from screen readers */}
        {phase === "booting" && (
          <div ref={bootRef} className="p-6 font-mono text-sm space-y-1.5" aria-hidden="true">
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
        )}

        {/* Mobile sidebar drawer */}
        {phase === "ready" && isMobile && (
          <>
            {/* Backdrop */}
            <div
              aria-hidden="true"
              className={`absolute inset-0 z-40 bg-black/50 transition-opacity duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
              onClick={() => setMenuOpen(false)}
            />
            {/* Drawer */}
            <div
              ref={drawerRef}
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              className={`absolute top-0 right-0 h-full w-64 z-50 bg-background border-l border-border flex flex-col pt-16 px-6 pb-8 gap-6 transition-transform duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
            >
              <p className="font-mono text-xs text-muted/50 tracking-widest uppercase mb-2" aria-hidden="true">Navigation</p>
              <nav aria-label="Mobile site navigation">
                <ul className="flex flex-col gap-6">
                  {navLinks.map(({ label, href }) => (
                    <li key={href}>
                      <a
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        className="text-sm text-muted hover:text-primary transition-colors duration-200 font-mono"
                      >
                        <span className="text-primary/50 mr-2" aria-hidden="true">~/</span>{label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              {resume && (
                <div className="mt-auto">
                  <a
                    href={resume.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono px-4 py-1.5 border border-primary text-primary rounded hover:bg-primary hover:text-background transition-all duration-200 block text-center"
                  >
                    Resume
                    <span className="sr-only">(opens {resume.fileName} in a new tab)</span>
                  </a>
                </div>
              )}
            </div>
          </>
        )}

        {/* Portfolio content — mounts on revealing, stays through ready */}
        {phase !== "booting" && (
          <div
            ref={contentRef}
            id="terminal-scroll"
            className="overflow-y-auto"
            style={{ height: "calc(100vh - 44px)", opacity: 0, scrollBehavior: "smooth" }}
          >
            {children}
          </div>
        )}
      </div>
    </>
  );
}
