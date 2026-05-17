"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import type { AchievementCertificateImage } from "@/lib/achievement-certificates";
import type { CarouselPlugin } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const CERTIFICATE_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  dsa: "Data Structures & Algorithms",
  mern: "MERN",
  react: "Frontend (React)",
  sql: "Databases & SQL",
  "superhack-2025-runner": "SuperOps Hackathon 2025",
};

function certificateLabel(certificate: AchievementCertificateImage): string {
  const fromName =
    certificate.fileName?.replace(/\.[a-z]+$/i, "") ??
    certificate.url.split("/").pop()?.replace(/\.[a-z]+$/i, "") ??
    "certificate";
  const slug = fromName.includes("/") ? fromName.split("/").pop()! : fromName;
  return CERTIFICATE_LABELS[slug] ?? slug.replace(/-/g, " ");
}

function CertificateSlide({
  certificate,
  achievementTitle,
}: {
  certificate: AchievementCertificateImage;
  achievementTitle: string;
}) {
  const label = certificateLabel(certificate);

  return (
    <div className="relative aspect-[5/3] w-full overflow-hidden rounded-md border border-border/80 bg-background">
      <Image
        src={certificate.url}
        alt={`${achievementTitle} — ${label} certificate`}
        fill
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, 45vw"
      />
      <p className="absolute bottom-0 inset-x-0 bg-linear-to-t from-background via-background/80 to-transparent px-3 py-2 font-mono text-xs text-muted">
        {label}
      </p>
    </div>
  );
}

export default function AchievementCertificateCarousel({
  certificates,
  achievementTitle,
}: {
  certificates: AchievementCertificateImage[];
  achievementTitle: string;
}) {
  const autoplayRef = useRef(Autoplay({ delay: 3500, stopOnInteraction: false }));
  const [plugins, setPlugins] = useState<NonNullable<CarouselPlugin>>([]);

  useEffect(() => {
    if (certificates.length <= 1) {
      setPlugins([]);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPlugins(reduced ? [] : [autoplayRef.current]);
  }, [certificates.length]);

  if (certificates.length === 0) return null;

  if (certificates.length === 1) {
    return (
      <CertificateSlide
        certificate={certificates[0]}
        achievementTitle={achievementTitle}
      />
    );
  }

  return (
    <Carousel
      className="w-full"
      opts={{ align: "start", loop: true }}
      plugins={plugins}
    >
      <CarouselContent className="ml-0">
        {certificates.map((certificate) => (
          <CarouselItem
            key={certificate.url}
            className="pl-0 basis-full"
          >
            <CertificateSlide
              certificate={certificate}
              achievementTitle={achievementTitle}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
