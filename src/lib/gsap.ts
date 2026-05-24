import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

type Gsap = typeof GsapType;
type ST = typeof ScrollTriggerType;

let gsapPromise: Promise<Gsap> | null = null;
let gsapWithSTPromise: Promise<{ gsap: Gsap; ScrollTrigger: ST }> | null = null;

export function loadGsap(): Promise<Gsap> {
  if (!gsapPromise) {
    gsapPromise = import("gsap").then((m) => m.default);
  }
  return gsapPromise;
}

export function loadGsapWithScrollTrigger(): Promise<{ gsap: Gsap; ScrollTrigger: ST }> {
  if (!gsapWithSTPromise) {
    gsapWithSTPromise = Promise.all([
      import("gsap").then((m) => m.default),
      import("gsap/ScrollTrigger").then((m) => m.ScrollTrigger),
    ]).then(([gsap, ScrollTrigger]) => {
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    });
  }
  return gsapWithSTPromise;
}
