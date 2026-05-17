import { hygraphImageUrl } from "@/lib/hygraph-image";
import type { PortfolioAchievement } from "@/types/portfolio";

export interface AchievementCertificateImage {
  url: string;
  fileName?: string | null;
}

/** Certificate images for carousel (Hygraph assets as WebP, with local URL fallback). */
export function getAchievementCertificates(
  achievement: PortfolioAchievement,
): AchievementCertificateImage[] {
  if (achievement.certificates?.length) {
    return achievement.certificates
      .filter((asset) => asset.url)
      .map((asset) => ({
        url: hygraphImageUrl(asset.url),
        fileName: asset.fileName,
      }));
  }

  const legacyUrls = achievement.certificateUrls?.length
    ? achievement.certificateUrls
    : achievement.certificateUrl
      ? [achievement.certificateUrl]
      : [];

  return legacyUrls.map((url) => ({ url, fileName: null }));
}

export function isAwardPlacement(placement: string): boolean {
  return /runner|winner|award|1st|2nd|3rd/i.test(placement);
}
