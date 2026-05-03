import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return createPageMetadata({
    title: "Демо-витрина",
    description: "Публичная витрина магазина: каталог, оформление заявки и контакты в мессенджерах.",
    path: `/store/${slug}`
  });
}

export default function StoreSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
