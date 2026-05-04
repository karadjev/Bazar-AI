import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Шаблоны витрин",
  description: "Готовые шаблоны витрин под ниши: мода, парфюм, халяль, торты, техника, салон. Откройте демо и запустите мастер.",
  path: "/templates"
});

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
