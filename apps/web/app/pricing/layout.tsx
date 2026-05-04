import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Тарифы и планы",
  description: "Прозрачные тарифы BuildYourStore.ai: старт, рост и бизнес. Без скрытых комиссий за заявки.",
  path: "/pricing"
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
