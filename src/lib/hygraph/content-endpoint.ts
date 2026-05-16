/** Public read endpoint (CDN) — same as the live portfolio fetch. */
export function getHygraphCdnEndpoint(): string {
  const endpoint = process.env.HYGRAPH_ENDPOINT;
  if (!endpoint) {
    throw new Error("[hygraph] HYGRAPH_ENDPOINT is not set");
  }
  return endpoint;
}

/** Hygraph Content API URL (mutations + asset upload). CDN endpoints are read-only. */
export function getHygraphContentEndpoint(): string {
  const fromEnv = process.env.HYGRAPH_CONTENT_ENDPOINT;
  if (fromEnv) return fromEnv;

  const endpoint = process.env.HYGRAPH_ENDPOINT;
  if (endpoint && !endpoint.includes("cdn.hygraph.com")) {
    return endpoint;
  }

  return "https://api-ap-south-1.hygraph.com/v2/cmox2ikd700nd07w3a7vdmu1c/master";
}

/** SiteSettings and other content mutations. */
export function getHygraphContentToken(): string {
  const token = process.env.HYGRAPH_TOKEN;
  if (!token) {
    throw new Error("[hygraph] HYGRAPH_TOKEN is not set");
  }
  return token;
}

/** Asset create / read / publish (resume uploads). */
export function getHygraphAssetToken(): string {
  const token = process.env.HYGRAPH_ASSET_TOKEN ?? process.env.HYGRAPH_TOKEN;
  if (!token) {
    throw new Error("[hygraph] HYGRAPH_ASSET_TOKEN is not set");
  }
  return token;
}
