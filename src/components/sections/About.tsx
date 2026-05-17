"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { hygraphImageUrl } from "@/lib/hygraph-image";
import type { PortfolioAsset, PortfolioSiteSettings } from "@/types/portfolio";

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

function AboutPhoto({
  photo,
  nickname,
}: {
  photo: PortfolioAsset;
  nickname: string;
}) {
  const src = hygraphImageUrl(photo.url);

  return (
    <figure className="about-photo relative w-full">
      <div className="relative aspect-[1883/2181] w-full overflow-hidden rounded-xl border border-border bg-surface shadow-[0_0_40px_-12px] shadow-primary/20">
        <Image
          src={src}
          alt={`${nickname} — profile`}
          fill
          className="object-cover object-top"
          sizes="(max-width: 640px) 120px, (max-width: 1024px) 200px, 280px"
          priority
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10"
          aria-hidden
        />
      </div>
    </figure>
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
  const [statsStarted, setStatsStarted] = useState(false);
  const photo = site.aboutPhoto;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const photoEl = section.querySelector<HTMLElement>(".about-photo");
    if (photoEl && !prefersReducedMotion) {
      gsap.set(photoEl, { opacity: 0, x: 24 });
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        if (prefersReducedMotion) {
          if (headingRef.current)
            gsap.set(headingRef.current, { clipPath: "inset(0 0% 0 0)" });
          if (paraRef.current) gsap.set(paraRef.current, { opacity: 1 });
          if (photoEl) gsap.set(photoEl, { opacity: 1, x: 0 });
          const cards = section.querySelectorAll<HTMLElement>(".stat-card");
          gsap.set(cards, { opacity: 1 });
          setStatsStarted(true);
          return;
        }

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
        if (paraRef.current) {
          gsap.fromTo(
            paraRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.2 },
          );
        }
        if (photoEl) {
          gsap.set(photoEl, { opacity: 0, x: 24 });
          gsap.to(photoEl, {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.15,
          });
        }
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
      <div className="max-w-5xl mx-auto">
        <p
          className="font-mono text-primary text-sm mb-4 tracking-wider"
          aria-hidden="true"
        >
          sky.about()
        </p>

        <div className="grid grid-cols-1 items-start gap-16 sm:grid-cols-[minmax(0,1fr)_clamp(9rem,28%,17.5rem)] sm:gap-x-14 sm:gap-y-0 md:gap-x-20 lg:gap-x-24">
          <div className="flex min-w-0 flex-col gap-10 sm:gap-12">
            <div>
              <h2
                id="about-heading"
                ref={headingRef}
                className="text-2xl sm:text-3xl md:text-3xl font-bold text-text leading-tight mb-4 sm:mb-6"
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
                className="text-muted text-base sm:text-lg leading-relaxed opacity-0"
              >
                {site.aboutBio}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="stat-card opacity-0 bg-surface border border-border rounded-xl p-5 sm:p-6 text-center hover:border-primary/50 transition-colors duration-300 cursor-default"
                >
                  <div className="text-3xl sm:text-4xl font-bold text-primary font-mono tabular-nums">
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

          {photo?.url ? (
            <div className="mx-auto w-full max-w-[280px] shrink-0 sm:mx-0 sm:max-w-none sm:justify-self-end sm:sticky sm:top-6">
              <AboutPhoto photo={photo} nickname={site.nickname} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
