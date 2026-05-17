/** Prefer WebP delivery for Hygraph Asset URLs when not already transformed. */
export function hygraphImageUrl(url: string): string {
  if (url.includes("output=format:")) return url;

  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const assetId = segments.at(-1);
    if (!assetId) return url;

    const projectPrefix = segments.slice(0, -1).join("/");
    parsed.pathname = `/${projectPrefix}/output=format:webp/${assetId}`;
    return parsed.toString();
  } catch {
    return url;
  }
}
