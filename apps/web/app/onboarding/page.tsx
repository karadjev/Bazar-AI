import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Мастер запуска магазина",
  description: "Пошаговый онбординг: ниша, город, контакты, стиль витрины и публикация ссылки.",
  path: "/onboarding"
});

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
