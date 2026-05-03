import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Редактор витрины",
  description: "Редактируйте блоки, стили и CTA витрины без кода. Предпросмотр на десктопе и мобильном.",
  path: "/editor"
});

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
