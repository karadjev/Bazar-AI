import { LandingPage } from "@/components/landing-page";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Интернет-магазин за 5 минут",
  path: "/"
});

export default function Home() {
  return <LandingPage />;
}
