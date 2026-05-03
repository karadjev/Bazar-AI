import type { Metadata } from "next";
import { getSiteUrl } from "./site";

export const SITE_NAME = "BuildYourStore.ai";
export const DEFAULT_DESCRIPTION =
  "AI создаёт красивую витрину, принимает заявки в Telegram и помогает продавать без программиста и дизайнера.";

/** Единый блок метаданных для вложенных маршрутов (canonical через metadataBase). */
export function createPageMetadata(opts: {
  title: string;
  description?: string;
  path: string;
}): Metadata {
  const base = getSiteUrl();
  const path = opts.path.startsWith("/") ? opts.path : `/${opts.path}`;
  const url = `${base}${path}`;
  const description = opts.description ?? DEFAULT_DESCRIPTION;
  const ogTitle = `${opts.title} · ${SITE_NAME}`;

  return {
    title: opts.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      url,
      siteName: SITE_NAME,
      title: ogTitle,
      description
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description
    }
  };
}
