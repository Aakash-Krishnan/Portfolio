"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // quickTo for ultra-smooth cursor lag
    const moveDot = gsap.quickTo(dot, "css", { duration: 0.1, ease: "none" });
    const moveRingX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3.out" });
    const moveRingY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      gsap.set(dot, { x: e.clientX, y: e.clientY });
      moveRingX(e.clientX);
      moveRingY(e.clientY);
    };

    const onEnterLink = () => {
      gsap.to(ring, { scale: 1.8, borderColor: "var(--color-primary)", duration: 0.25, ease: "power2.out" });
      gsap.to(dot, { scale: 0, duration: 0.2 });
    };

    const onLeaveLink = () => {
      gsap.to(ring, { scale: 1, borderColor: "rgba(34,197,94,0.5)", duration: 0.35, ease: "elastic.out(1,0.5)" });
      gsap.to(dot, { scale: 1, duration: 0.2 });
    };

    document.addEventListener("mousemove", onMove);

    const interactives = document.querySelectorAll("a, button, [data-magnetic]");
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onEnterLink);
      el.addEventListener("mouseleave", onLeaveLink);
    });

    return () => {
      document.removeEventListener("mousemove", onMove);
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onEnterLink);
        el.removeEventListener("mouseleave", onLeaveLink);
      });
    };
  }, []);

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: "transform" }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-primary/50 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: "transform" }}
      />
    </>
  );
}
