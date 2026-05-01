"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Footer, Header, Section } from "@/components/ui-kit";
import { storefrontThemes } from "@/lib/themes";

const templates = [
  { name: "Luxury Perfume", niche: "Beauty", image: storefrontThemes[3].image, useCase: "Премиум подарки и private order" },
  { name: "Fashion Boutique", niche: "Fashion", image: storefrontThemes[0].image, useCase: "Коллекции и сезонные дропы" },
  { name: "Halal Grocery", niche: "Grocery", image: storefrontThemes[2].image, useCase: "Быстрый заказ продуктовых наборов" },
  { name: "Bakery", niche: "Food", image: storefrontThemes[4].image, useCase: "Торты к событиям и предзаказы" },
  { name: "Electronics", niche: "Tech", image: storefrontThemes[6].image, useCase: "Техника в наличии + гарантия" },
  { name: "Beauty Studio", niche: "Beauty", image: storefrontThemes[9].image, useCase: "Запись на услуги и отзывы" }
];

export default function TemplatesPage() {
  const [activeNiche, setActiveNiche] = useState("All");
  const niches = ["All", "Fashion", "Beauty", "Grocery", "Food", "Tech"];
  const filtered = useMemo(
    () => templates.filter((template) => activeNiche === "All" || template.niche === activeNiche),
    [activeNiche]
  );

  return (
    <main className="min-h-screen bg-paper text-ink">
      <Header />
      <Section eyebrow="Templates" title="Готовые storefront-шаблоны" text="Выберите нишу и откройте премиальный preview за секунды.">
        <div className="mb-6 grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold text-neutral-500">Before</p>
            <p className="mt-1 text-sm font-semibold">Обычный лендинг без mobile flow</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500">After</p>
            <p className="mt-1 text-sm font-semibold">Storefront + заявки + понятный CTA</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-500">Use cases</p>
            <p className="mt-1 text-sm font-semibold">Fashion, beauty, grocery, food, tech</p>
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {niches.map((niche) => (
            <button
              key={niche}
              onClick={() => setActiveNiche(niche)}
              className={`h-10 rounded-2xl px-4 text-sm font-semibold ${activeNiche === niche ? "bg-ink text-white" : "border border-line bg-white"}`}
            >
              {niche}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center">
            <p className="text-lg font-semibold">Шаблоны скоро появятся</p>
            <p className="mt-2 text-sm text-neutral-500">Попробуйте другую нишу или создайте магазин из onboarding.</p>
            <Link href="/onboarding" className="mt-4 inline-flex h-10 items-center rounded-2xl bg-ink px-4 text-sm font-semibold text-white">
              Создать магазин
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((template) => (
              <article key={template.name} className="rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-premium">
                <div className="relative mx-auto w-[180px] rounded-[28px] border-4 border-neutral-900 bg-neutral-900 p-2">
                  <div className="relative aspect-[9/16] overflow-hidden rounded-[20px]">
                    <Image src={template.image} alt={template.name} fill className="object-cover" sizes="180px" />
                    <div className="loading-shimmer absolute inset-0" />
                  </div>
                </div>
                <div className="mt-3 inline-flex rounded-full bg-neutral-100 px-2 py-1 text-[11px] font-semibold text-neutral-600">{template.niche}</div>
                <p className="mt-3 text-lg font-semibold">{template.name}</p>
                <p className="mt-2 text-sm text-neutral-600">{template.useCase}</p>
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
        )}
      </Section>
      <Footer />
    </main>
  );
}
