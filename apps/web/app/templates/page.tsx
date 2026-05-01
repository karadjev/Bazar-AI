import Link from "next/link";
import { Footer, Header, Section } from "@/components/ui-kit";

const templates = [
  "Luxury Perfume",
  "Fashion Boutique",
  "Halal Grocery",
  "Bakery",
  "Electronics",
  "Beauty Studio"
];

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <Header />
      <Section eyebrow="Templates" title="Готовые storefront-шаблоны">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((name) => (
            <article key={name} className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <div className="h-32 rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-violet-100" />
              <p className="mt-4 text-lg font-semibold">{name}</p>
              <p className="mt-2 text-sm text-neutral-600">Готовая композиция карточек, доверия и checkout-блоков.</p>
              <div className="mt-4 flex gap-2">
                <Link href="/store/oud-house" className="inline-flex h-10 items-center rounded-2xl bg-ink px-4 text-sm font-semibold text-white">
                  Preview
                </Link>
                <Link href="/onboarding" className="inline-flex h-10 items-center rounded-2xl border border-line bg-white px-4 text-sm font-semibold">
                  Создать
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>
      <Footer />
    </main>
  );
}
