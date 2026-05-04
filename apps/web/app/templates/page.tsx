"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Footer, Header, Section } from "@/components/ui-kit";
import { storefrontThemesLite } from "@/lib/themes-lite";
import { demoSlugForThemeCode } from "@/lib/themes-utils";

const templates = [
  { name: "Премиальный парфюм", niche: "Красота", onboardingNiche: "Парфюм", image: storefrontThemesLite[3].image, useCase: "Премиум-подарки и персональный заказ", style: "perfume-luxury", city: "Грозный" },
  { name: "Модный бутик", niche: "Одежда", onboardingNiche: "Женская одежда", image: storefrontThemesLite[0].image, useCase: "Коллекции и сезонные дропы", style: "premium-fashion", city: "Магас" },
  { name: "Халяль-маркет", niche: "Продукты", onboardingNiche: "Халяль-продукты", image: storefrontThemesLite[2].image, useCase: "Быстрый заказ продуктовых наборов", style: "halal-market", city: "Назрань" },
  { name: "Кондитерская", niche: "Еда", onboardingNiche: "Торты", image: storefrontThemesLite[4].image, useCase: "Торты к событиям и предзаказы", style: "cakes-food", city: "Махачкала" },
  { name: "Электроника", niche: "Техника", onboardingNiche: "Техника", image: storefrontThemesLite[6].image, useCase: "Техника в наличии и гарантия", style: "electronics", city: "Владикавказ" },
  { name: "Студия красоты", niche: "Красота", onboardingNiche: "Салон красоты", image: storefrontThemesLite[9].image, useCase: "Запись на услуги и отзывы", style: "beauty-salon", city: "Дербент" }
];

export default function TemplatesPage() {
  const [activeNiche, setActiveNiche] = useState("Все");
  const niches = ["Все", "Одежда", "Красота", "Продукты", "Еда", "Техника"];
  const filtered = useMemo(
    () => templates.filter((template) => activeNiche === "Все" || template.niche === activeNiche),
    [activeNiche]
  );

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-paper text-ink premium-grid" data-testid="page-templates">
      <Header />
      <section className="shell relative pb-4 pt-8 md:pb-6 md:pt-14">
        <div
          className="hero-ambient -left-32 top-2 hidden h-[420px] w-[420px] bg-gradient-to-br from-sea/28 via-berry/16 to-saffron/10 lg:block"
          aria-hidden
        />
        <div
          className="hero-ambient right-[-100px] top-32 hidden h-[300px] w-[300px] bg-gradient-to-tl from-saffron/25 via-sea/14 to-transparent lg:block"
          aria-hidden
        />
        <div className="relative z-[1] max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-gradient-to-r from-white/95 to-white/85 px-4 py-2 text-xs font-bold text-neutral-700 shadow-[0_1px_0_rgba(255,255,255,1)_inset,0_12px_40px_rgba(201,137,31,0.1)] ring-1 ring-saffron/15 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-saffron shadow-[0_0_10px_rgba(201,137,31,0.55)]" aria-hidden />
            Галерея витрин
          </p>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-[-0.035em] md:text-5xl lg:text-[3.2rem] lg:leading-[1.05]">
            Шаблоны, которые{" "}
            <span className="bg-gradient-to-r from-sea via-berry to-saffron bg-clip-text text-transparent drop-shadow-[0_2px_20px_rgba(29,111,130,0.14)]">
              выглядят как бренд
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg md:leading-8">
            Ниша, превью в телефоне и демо-магазин — за секунды. Выберите фильтр или откройте «Все».
          </p>
        </div>
      </section>
      <Section eyebrow="Шаблоны" title="Готовые витрины под задачу" text="Выберите нишу и откройте премиальный preview за секунды." className="!pt-4 md:!pt-8">
        <div className="relative mb-8">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-sea/18 via-white/45 to-berry/16 opacity-90 blur-xl" aria-hidden />
          <div className="relative grid gap-4 rounded-2xl border border-white/60 bg-gradient-to-br from-white/[0.97] to-white/88 p-4 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_24px_70px_rgba(10,13,18,0.08)] ring-1 ring-black/[0.03] md:grid-cols-3 md:p-5">
            <div className="rounded-xl border border-line/60 bg-white/60 p-3 backdrop-blur-sm md:border-0 md:bg-transparent md:p-2 md:backdrop-blur-none">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-sea">До</p>
              <p className="mt-2 text-sm font-semibold leading-snug text-neutral-800">Плоский лендинг без мобильного сценария</p>
            </div>
            <div className="rounded-xl border border-line/60 bg-white/60 p-3 backdrop-blur-sm md:border-0 md:border-l md:border-line/50 md:bg-transparent md:p-2 md:pl-5 md:backdrop-blur-none">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-berry">После</p>
              <p className="mt-2 text-sm font-semibold leading-snug text-neutral-800">Storefront, заявки и ясный CTA в одном потоке</p>
            </div>
            <div className="rounded-xl border border-line/60 bg-white/60 p-3 backdrop-blur-sm md:border-0 md:border-l md:border-line/50 md:bg-transparent md:p-2 md:pl-5 md:backdrop-blur-none">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">Сценарии</p>
              <p className="mt-2 text-sm font-semibold leading-snug text-neutral-800">Одежда, красота, продукты, еда, техника</p>
            </div>
          </div>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {niches.map((niche) => (
            <button
              key={niche}
              type="button"
              onClick={() => setActiveNiche(niche)}
              className={`focus-ring h-10 shrink-0 rounded-2xl px-4 text-sm font-bold transition duration-200 ease-premium ${
                activeNiche === niche
                  ? "bg-gradient-to-r from-ink to-sea text-white shadow-[0_14px_36px_rgba(10,13,18,0.25)] ring-1 ring-white/20"
                  : "border border-line/90 bg-white/95 shadow-sm ring-1 ring-black/[0.02] hover:border-sea/25 hover:bg-white hover:shadow-md"
              }`}
            >
              {niche}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sea/25 bg-gradient-to-b from-white/95 to-paper/90 p-10 text-center shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] ring-1 ring-black/[0.03]">
            <p className="text-lg font-semibold tracking-tight text-neutral-900">В этой нише пока нет карточек</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">
              Сбросьте фильтр на «Все» или запустите мастер и соберите витрину под свою нишу.
            </p>
            <Link
              href="/onboarding"
              className="mt-5 inline-flex h-11 items-center rounded-2xl bg-gradient-to-r from-ink via-[#121826] to-sea px-5 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(10,13,18,0.28)] transition duration-200 ease-premium hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
            >
              Создать магазин
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((template, index) => (
              <article
                key={template.name}
                className="group relative rounded-[1.35rem] bg-gradient-to-br from-sea/15 via-line/30 to-berry/15 p-px shadow-glowSoft transition duration-200 ease-premium hover:shadow-glowSea"
              >
                <div className="relative h-full rounded-[1.3rem] border border-white/70 bg-white/[0.97] p-5 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset] ring-1 ring-black/[0.02] transition duration-200 ease-premium group-hover:-translate-y-1 group-hover:border-sea/15">
                  <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sea/20 to-transparent opacity-0 transition group-hover:opacity-100" aria-hidden />
                  <div className="relative mx-auto w-[180px]">
                    <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-sea/20 to-berry/15 opacity-60 blur-xl transition group-hover:opacity-90" aria-hidden />
                    <div className="relative rounded-[28px] border-4 border-[#0c0f14] bg-gradient-to-b from-neutral-800 to-neutral-950 p-2 shadow-[0_24px_56px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]">
                      <div className="relative aspect-[9/16] overflow-hidden rounded-[20px] ring-1 ring-white/10">
                        <Image
                          src={template.image}
                          alt={template.name}
                          fill
                          className="object-cover transition duration-500 ease-premium group-hover:scale-[1.04]"
                          sizes="180px"
                          priority={index === 0}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 inline-flex rounded-full border border-line/80 bg-gradient-to-r from-paper to-white px-2.5 py-1 text-[11px] font-bold text-neutral-700 shadow-sm">
                    {template.niche}
                  </div>
                  <p className="mt-3 text-lg font-semibold tracking-tight text-neutral-900">{template.name}</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{template.useCase}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/store/${demoSlugForThemeCode(template.style)}`}
                      className="inline-flex h-10 items-center rounded-2xl bg-gradient-to-r from-ink to-sea px-4 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(10,13,18,0.22)] transition duration-200 ease-premium hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
                    >
                      Открыть демо
                    </Link>
                    <Link
                      href={`/onboarding?niche=${encodeURIComponent(template.onboardingNiche)}&style=${encodeURIComponent(template.style)}&name=${encodeURIComponent(template.name)}&city=${encodeURIComponent(template.city)}`}
                      className="inline-flex h-10 items-center rounded-2xl border border-line/90 bg-white/95 px-4 text-sm font-semibold shadow-sm ring-1 ring-black/[0.02] transition duration-200 ease-premium hover:-translate-y-0.5 hover:border-sea/22 hover:bg-white active:translate-y-0"
                    >
                      Создать по шаблону
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>
      <section className="shell pb-16 md:pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink via-[#121826] to-sea p-8 text-white shadow-[0_36px_100px_rgba(10,13,18,0.42),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/10 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_30%_100%,rgba(29,111,130,0.35),transparent_55%)]" aria-hidden />
          <h2 className="relative max-w-xl text-2xl font-extrabold leading-tight tracking-[-0.03em] md:text-3xl">Не нашли идеальный шаблон?</h2>
          <p className="relative mt-3 max-w-lg text-sm leading-7 text-white/75">Мастер запуска соберёт витрину под ваш город, нишу и стиль за минуты.</p>
          <div className="relative mt-6 flex flex-wrap gap-3">
            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-ink shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition duration-200 ease-premium hover:-translate-y-0.5 hover:bg-neutral-100 active:translate-y-0"
            >
              Собрать с нуля
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/28 bg-white/5 px-5 text-sm font-semibold backdrop-blur-sm transition duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/12 active:translate-y-0"
            >
              Тарифы
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
