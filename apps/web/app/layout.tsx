import type { Metadata, Viewport } from "next";
import "./globals.css";
import { JsonLd } from "@/components/json-ld";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();
const defaultTitle = `${SITE_NAME} — интернет-магазин за 5 минут`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: defaultTitle, template: `%s · ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: SITE_NAME,
    title: defaultTitle,
    description: DEFAULT_DESCRIPTION
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: DEFAULT_DESCRIPTION
  },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f7fb"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="relative min-h-screen">
        <JsonLd />
        <a href="#page-main" className="skip-link">
          К основному содержимому
        </a>
        <div id="page-main" tabIndex={-1} className="outline-none">
          {children}
        </div>
      </body>
    </html>
  );
}
