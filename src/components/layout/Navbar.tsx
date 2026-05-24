"use client";

import { useEffect, useRef, useState } from "react";
import { loadGsap } from "@/lib/gsap";

const NAV_LINKS = [
  { label: "Work", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    loadGsap().then((gsap) => {
      gsap.fromTo(
        navRef.current,
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.3 }
      );
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  // Focus first drawer link when opened
  useEffect(() => {
    if (!menuOpen || !drawerRef.current) return;
    const firstLink = drawerRef.current.querySelector<HTMLElement>("a, button");
    firstLink?.focus();
  }, [menuOpen]);

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Site navigation"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/90 backdrop-blur-md border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a
            href="#hero"
            aria-label="Sky — back to top"
            className="font-mono text-primary text-sm font-semibold tracking-widest hover:opacity-80 transition-opacity"
          >
            sky<span className="text-muted" aria-hidden="true">@dev</span>
            <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-pulse align-middle" aria-hidden="true" />
          </a>

          {!isMobile && (
            <ul className="flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted hover:text-text transition-colors duration-200 font-mono"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono px-4 py-1.5 border border-primary text-primary rounded hover:bg-primary hover:text-background transition-all duration-200"
                >
                  Resume
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              </li>
            </ul>
          )}

          {isMobile && (
            <button
              className="flex flex-col justify-center items-center gap-1.5 w-8 h-8 text-muted hover:text-primary transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="navbar-mobile-drawer"
            >
              <span className={`block h-px w-5 bg-current transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} aria-hidden="true" />
              <span className={`block h-px w-5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} aria-hidden="true" />
              <span className={`block h-px w-5 bg-current transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 translate-y-[-7px]" : ""}`} aria-hidden="true" />
            </button>
          )}
        </div>
      </nav>

      {isMobile && (
        <>
          {/* Backdrop */}
          <div
            aria-hidden="true"
            className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
              menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer */}
          <div
            ref={drawerRef}
            id="navbar-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className={`fixed top-0 right-0 h-full w-64 z-50 bg-background border-l border-border flex flex-col pt-20 px-6 pb-8 gap-6 transition-transform duration-300 ease-in-out ${
              menuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <p className="font-mono text-xs text-muted/50 tracking-widest uppercase mb-2" aria-hidden="true">Navigation</p>
            <nav aria-label="Mobile site navigation">
              <ul className="flex flex-col gap-6">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-sm text-muted hover:text-primary transition-colors duration-200 font-mono"
                    >
                      <span className="text-primary/50 mr-2" aria-hidden="true">~/</span>{link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-auto">
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono px-4 py-1.5 border border-primary text-primary rounded hover:bg-primary hover:text-background transition-all duration-200 block text-center"
              >
                Resume
                <span className="sr-only">(opens in new tab)</span>
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
