import type { Metadata } from "next";
import { SellerDashboard } from "@/components/seller-dashboard";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Кабинет продавца",
  description: "Заявки, товары, аналитика и AI-подсказки для вашей витрины BuildYourStore.ai.",
  path: "/dashboard"
});

export default function DashboardPage() {
  return <SellerDashboard />;
}
