"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Footer, Header, Section } from "@/components/ui-kit";
import { demoSlugForThemeCode, storefrontThemes } from "@/lib/themes";

const templates = [
  { name: "Премиальный парфюм", niche: "Красота", onboardingNiche: "Парфюм", image: storefrontThemes[3].image, useCase: "Премиум-подарки и персональный заказ", style: "perfume-luxury", city: "Грозный" },
  { name: "Модный бутик", niche: "Одежда", onboardingNiche: "Женская одежда", image: storefrontThemes[0].image, useCase: "Коллекции и сезонные дропы", style: "premium-fashion", city: "Магас" },
  { name: "Халяль-маркет", niche: "Продукты", onboardingNiche: "Халяль-продукты", image: storefrontThemes[2].image, useCase: "Быстрый заказ продуктовых наборов", style: "halal-market", city: "Назрань" },
  { name: "Кондитерская", niche: "Еда", onboardingNiche: "Торты", image: storefrontThemes[4].image, useCase: "Торты к событиям и предзаказы", style: "cakes-food", city: "Махачкала" },
  { name: "Электроника", niche: "Техника", onboardingNiche: "Техника", image: storefrontThemes[6].image, useCase: "Техника в наличии и гарантия", style: "electronics", city: "Владикавказ" },
  { name: "Студия красоты", niche: "Красота", onboardingNiche: "Салон красоты", image: storefrontThemes[9].image, useCase: "Запись на услуги и отзывы", style: "beauty-salon", city: "Дербент" }
];

export default function TemplatesPage() {
  const [activeNiche, setActiveNiche] = useState("Все");
  const niches = ["Все", "Одежда", "Красота", "Продукты", "Еда", "Техника"];
  const filtered = useMemo(
    () => templates.filter((template) => activeNiche === "Все" || template.niche === activeNiche),
    [activeNiche]
  );

  return (
    <main className="min-h-screen bg-paper text-ink" data-testid="page-templates">
      <Header />
      <Section eyebrow="Шаблоны" title="Готовые шаблоны витрин" text="Выберите нишу и откройте премиальный preview за секунды.">
        <div className="mb-6 grid gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm transition duration-200 hover:border-neutral-200 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">До</p>
            <p className="mt-1 text-sm font-semibold leading-snug">Обычный лендинг без мобильного сценария</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">После</p>
            <p className="mt-1 text-sm font-semibold leading-snug">Storefront + заявки + понятный CTA</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Сценарии</p>
            <p className="mt-1 text-sm font-semibold leading-snug">Одежда, красота, продукты, еда, техника</p>
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {niches.map((niche) => (
            <button
              key={niche}
              type="button"
              onClick={() => setActiveNiche(niche)}
              className={`focus-ring h-10 shrink-0 rounded-2xl px-4 text-sm font-semibold transition duration-200 ${activeNiche === niche ? "bg-ink text-white shadow-sm" : "border border-line bg-white hover:border-neutral-300 hover:bg-neutral-50"}`}
            >
              {niche}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold tracking-tight">В этой нише пока нет карточек</p>
            <p className="mt-2 text-sm leading-6 text-neutral-500">Сбросьте фильтр на «Все» или запустите мастер и соберите витрину под свою нишу.</p>
            <Link href="/onboarding" className="mt-4 inline-flex h-10 items-center rounded-2xl bg-ink px-4 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(13,17,23,0.2)] transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0">
              Создать магазин
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((template) => (
              <article key={template.name} className="rounded-2xl border border-line bg-white p-5 shadow-soft transition duration-200 hover:-translate-y-1 hover:border-neutral-200 hover:shadow-premium">
                <div className="relative mx-auto w-[180px] rounded-[28px] border-4 border-neutral-900 bg-neutral-900 p-2 shadow-lg">
                  <div className="relative aspect-[9/16] overflow-hidden rounded-[20px]">
                    <Image src={template.image} alt={template.name} fill className="object-cover transition duration-500 hover:scale-105" sizes="180px" />
                  </div>
                </div>
                <div className="mt-3 inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-600">{template.niche}</div>
                <p className="mt-3 text-lg font-semibold tracking-tight">{template.name}</p>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{template.useCase}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/store/${demoSlugForThemeCode(template.style)}`} className="inline-flex h-10 items-center rounded-2xl bg-ink px-4 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0">
                    Открыть демо
                  </Link>
                  <Link href={`/onboarding?niche=${encodeURIComponent(template.onboardingNiche)}&style=${encodeURIComponent(template.style)}&name=${encodeURIComponent(template.name)}&city=${encodeURIComponent(template.city)}`} className="inline-flex h-10 items-center rounded-2xl border border-line bg-white px-4 text-sm font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50 active:translate-y-0">
                    Создать по шаблону
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
