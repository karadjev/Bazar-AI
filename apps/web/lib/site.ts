/**
 * Публичный origin сайта.
 *
 * Продакшен: задайте NEXT_PUBLIC_SITE_URL (например https://app.example.com) на этапе сборки —
 * иначе canonical/OG/JSON-LD укажут на localhost или только на временный VERCEL_URL.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}
