"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import BootOverlay from "./BootOverlay";

export default function BootController({ children }: { children: React.ReactNode }) {
  const [booted, setBooted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!booted || !contentRef.current) return;
    gsap.fromTo(
      contentRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: "power2.out" }
    );
  }, [booted]);

  return (
    <>
      {!booted && <BootOverlay onComplete={() => setBooted(true)} />}
      <div ref={contentRef} style={{ opacity: 0 }}>
        {children}
      </div>
    </>
  );
}
