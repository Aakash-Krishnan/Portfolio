"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import AchievementCertificateCarousel from "@/components/achievements/AchievementCertificateCarousel";
import AchievementPlacementBadge from "@/components/achievements/AchievementPlacementBadge";
import {
  getAchievementCertificates,
  isAwardPlacement,
} from "@/lib/achievement-certificates";
import type { PortfolioAchievement } from "@/types/portfolio";

function AchievementCard({ achievement }: { achievement: PortfolioAchievement }) {
  const certificates = getAchievementCertificates(achievement);
  const awardBadge = isAwardPlacement(achievement.placement);

  return (
    <article className="achievement-card opacity-0 flex h-full flex-col bg-surface border border-border rounded-lg overflow-hidden hover:border-primary/40 transition-colors duration-300">
      {certificates.length > 0 ? (
        <div className="border-b border-border/80 p-3">
          <AchievementCertificateCarousel
            certificates={certificates}
            achievementTitle={achievement.title}
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 space-y-2">
          <h3 className="text-text font-semibold text-base leading-snug line-clamp-2">
            {achievement.title}
          </h3>
          <p className="font-mono text-xs text-muted leading-snug">
            {achievement.event}
          </p>
          <AchievementPlacementBadge
            placement={achievement.placement}
            awardBadge={awardBadge}
          />
        </div>
        <p className="text-sm text-muted leading-relaxed mb-3 line-clamp-3 flex-1">
          {achievement.description}
        </p>
        <p className="font-mono text-xs text-primary/70 mb-3 border-l-2 border-primary/30 pl-3 line-clamp-2">
          {achievement.highlight}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {achievement.topics.slice(0, 5).map((topic) => (
            <span
              key={topic}
              className="text-xs font-mono px-2 py-0.5 rounded-full bg-background border border-border text-muted"
            >
              {topic}
            </span>
          ))}
          {achievement.topics.length > 5 ? (
            <span className="text-xs font-mono px-2 py-0.5 text-muted">
              +{achievement.topics.length - 5}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function Achievements({
  achievements,
}: {
  achievements: PortfolioAchievement[];
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll<HTMLElement>(".achievement-card");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (prefersReducedMotion) {
          gsap.set(cards, { opacity: 1, y: 0 });
          return;
        }
        gsap.fromTo(
          cards,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.12,
            ease: "power3.out",
          },
        );
      },
      { root: document.getElementById("terminal-scroll"), threshold: 0.1 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  if (achievements.length === 0) return null;

  return (
    <section
      id="achievements"
      ref={sectionRef}
      aria-labelledby="achievements-heading"
      className="my-20 py-4 px-6"
    >
      <div className="max-w-4xl mx-auto">
        <p
          className="font-mono text-primary text-sm mb-4 tracking-wider"
          aria-hidden="true"
        >
          $ cat ./achievements.log
        </p>
        <h2
          id="achievements-heading"
          className="text-3xl font-bold text-text mb-10"
        >
          Recognition
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.title} achievement={achievement} />
          ))}
        </div>
      </div>
    </section>
  );
}
