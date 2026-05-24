import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// GTM requires unsafe-inline — nonce-based approach needs server-side tagging infra
// React requires unsafe-eval in development for call stack reconstruction
const cspHeader = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com`,
  `style-src 'self' 'unsafe-inline'`,
  // next/font/google downloads fonts at build time → served from self, no googleapis needed
  `font-src 'self'`,
  // Hygraph is server-side only; only GA/GTM endpoints needed client-side
  `connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net`,
  `img-src 'self' data: https://ap-south-1.graphassets.com`,
  // GTM noscript iframe fallback
  `frame-src https://www.googletagmanager.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

const INTERNAL_VAULT_PATH = "/vault/resume";

function normalizePath(path: string): string {
  if (!path.startsWith("/")) return `/${path}`;
  return path.replace(/\/+$/, "") || "/";
}

const customVaultPath = process.env.RESUME_VAULT_PATH
  ? normalizePath(process.env.RESUME_VAULT_PATH)
  : null;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ap-south-1.graphassets.com",
        pathname: "/cmox2ikvb04p307o19gcxhjp7/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ];
  },
  async redirects() {
    if (customVaultPath && customVaultPath !== INTERNAL_VAULT_PATH) {
      return [
        {
          source: INTERNAL_VAULT_PATH,
          destination: "/",
          permanent: false,
        },
      ];
    }
    return [];
  },
  async rewrites() {
    if (customVaultPath && customVaultPath !== INTERNAL_VAULT_PATH) {
      return [
        {
          source: customVaultPath,
          destination: INTERNAL_VAULT_PATH,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
