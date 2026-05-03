import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

const siteUrlWarnKey = "__bazarNextSiteUrlWarned";
const g = globalThis as typeof globalThis & { [siteUrlWarnKey]?: boolean };
if (
  process.env.NODE_ENV === "production" &&
  !process.env.NEXT_PUBLIC_SITE_URL?.trim() &&
  !process.env.VERCEL_URL?.trim() &&
  !g[siteUrlWarnKey]
) {
  g[siteUrlWarnKey] = true;
  console.warn(
    "\n[apps/web] NEXT_PUBLIC_SITE_URL не задан при production-сборке: абсолютные URL в metadata/OG/JSON-LD будут как у dev. Задайте публичный URL (см. apps/web/.env.example).\n"
  );
}

export default nextConfig;
