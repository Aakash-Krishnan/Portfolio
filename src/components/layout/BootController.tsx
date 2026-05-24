"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import BootOverlay from "./BootOverlay";

export default function BootController({ children }: { children: React.ReactNode }) {
  const [booted, setBooted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!booted || !contentRef.current) return;
    // Content is already visible — just do a subtle scale entrance as overlay exits
    gsap.fromTo(
      contentRef.current,
      { scale: 0.98 },
      { scale: 1, duration: 0.5, ease: "power2.out" }
    );
  }, [booted]);

  return (
    <>
      {!booted && <BootOverlay onComplete={() => setBooted(true)} />}
      {/*
       * No opacity:0 here — content must be visible in the DOM from the start
       * so the browser can paint LCP. The boot overlay covers it via z-[100].
       * GSAP fades it from 0→1 after boot only to smooth the overlay exit.
       */}
      <div ref={contentRef}>
        {children}
      </div>
    </>
  );
}
