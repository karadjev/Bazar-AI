import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true"
});

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ],
    // В development оптимизация remote images гоняет каждый запрос через Node (Sharp + fetch Unsplash).
    // В Docker это даёт очередь из десятков `/_next/image` и страница «висит» на загрузке.
    unoptimized: process.env.NODE_ENV === "development"
  }
};

const siteUrlWarnKey = "__bazarNextSiteUrlWarned";
const g = globalThis as typeof globalThis & { [siteUrlWarnKey]?: boolean };
const isBuildCommand = process.env.npm_lifecycle_event === "build";
if (
  process.env.NODE_ENV === "production" &&
  isBuildCommand &&
  !process.env.NEXT_PUBLIC_SITE_URL?.trim() &&
  !process.env.VERCEL_URL?.trim() &&
  !g[siteUrlWarnKey]
) {
  g[siteUrlWarnKey] = true;
  console.warn(
    "\n[apps/web] NEXT_PUBLIC_SITE_URL не задан при production-сборке: абсолютные URL в metadata/OG/JSON-LD будут как у dev. Задайте публичный URL (см. apps/web/.env.example).\n"
  );
}

export default withBundleAnalyzer(nextConfig);
