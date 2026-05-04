"use client";

import Link from "next/link";
import { useState } from "react";
import { Footer, Header, PricingCard, Section } from "@/components/ui-kit";

const faq: Array<{ q: string; a: string }> = [
  {
    q: "Можно ли перейти с «Старт» на «Рост» без потери данных?",
    a: "Да. Данные магазина и заявки остаются в вашем аккаунте, меняется только тарифный пакет и лимиты."
  },
  {
    q: "Есть ли комиссия за заявки и заказы?",
    a: "Нет скрытой комиссии за заявки в текущей модели: вы платите за платформу, а расчеты с клиентом ведете как удобно вам."
  },
  {
    q: "Поддерживается ли несколько storefront на одном аккаунте?",
    a: "Да, это сценарий «Бизнес»: несколько витрин и командная работа. На «Старт» и «Рост» фокус на одной основной витрине."
  },
  {
    q: "Можно ли кастомизировать бренд и домен?",
    a: "Бренд настраивается в мастере и редакторе. Собственный домен подключается на этапе деплоя инфраструктуры."
  }
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const yearly = billing === "yearly";

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-paper text-ink premium-grid" data-testid="page-pricing">
      <Header />
      <section className="shell relative pb-4 pt-8 md:pb-6 md:pt-14">
        <div
          className="hero-ambient -left-24 top-0 hidden h-[380px] w-[380px] bg-gradient-to-br from-berry/25 via-sea/18 to-transparent lg:block"
          aria-hidden
        />
        <div
          className="hero-ambient right-[-90px] top-24 hidden h-[320px] w-[320px] bg-gradient-to-tl from-sea/28 via-saffron/12 to-transparent lg:block"
          aria-hidden
        />
        <div className="relative z-[1] max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-gradient-to-r from-white/95 to-white/85 px-4 py-2 text-xs font-bold text-neutral-700 shadow-[0_1px_0_rgba(255,255,255,1)_inset,0_12px_40px_rgba(139,50,88,0.08)] ring-1 ring-berry/10 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-berry shadow-[0_0_10px_rgba(139,50,88,0.45)]" aria-hidden />
            Прозрачные планы
          </p>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-[-0.035em] md:text-5xl lg:text-[3.2rem] lg:leading-[1.05]">
            Тарифы, которые{" "}
            <span className="bg-gradient-to-r from-sea via-berry to-saffron bg-clip-text text-transparent drop-shadow-[0_2px_20px_rgba(139,50,88,0.12)]">
              растут вместе с вами
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg md:leading-8">
            Без скрытых платежей и комиссий за заявки — только понятные лимиты и спокойный запуск.
          </p>
        </div>
      </section>
      <Section eyebrow="Тарифы" title="Планы для старта и масштабирования" text="Без скрытых платежей, с понятными лимитами и быстрым стартом." className="!pt-4 md:!pt-8">
        <div className="relative mb-8">
          <div className="absolute -inset-1 rounded-[1.35rem] bg-gradient-to-br from-sea/20 via-white/50 to-berry/20 opacity-80 blur-xl" aria-hidden />
          <div className="relative flex flex-col gap-3 rounded-2xl bg-gradient-to-br from-sea/12 via-line/25 to-berry/12 p-px shadow-glowSoft">
            <div className="flex flex-col gap-3 rounded-[1.05rem] border border-white/70 bg-white/[0.96] p-3 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_20px_56px_rgba(10,13,18,0.07)] ring-1 ring-black/[0.03] sm:flex-row sm:items-center sm:justify-between sm:px-2">
              <div className="inline-flex rounded-2xl border border-line/90 bg-paper/90 p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => setBilling("monthly")}
                  className={`focus-ring h-9 rounded-xl px-3 text-sm font-semibold transition duration-200 ease-premium ${billing === "monthly" ? "bg-gradient-to-r from-ink to-sea text-white shadow-md" : "text-neutral-600 hover:bg-white/90"}`}
                >
                  Помесячно
                </button>
                <button
                  type="button"
                  onClick={() => setBilling("yearly")}
                  className={`focus-ring h-9 rounded-xl px-3 text-sm font-semibold transition duration-200 ease-premium ${billing === "yearly" ? "bg-gradient-to-r from-ink to-sea text-white shadow-md" : "text-neutral-600 hover:bg-white/90"}`}
                >
                  За год -20%
                </button>
              </div>
              <p className="px-1 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500 sm:pr-3">Без комиссии за заявки</p>
            </div>
          </div>
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          {["Гарантия 14 дней", "Можно отменить в любой момент", "Без скрытых платежей"].map((item) => (
            <span
              key={item}
              className="rounded-full border border-line/80 bg-gradient-to-b from-white/95 to-white/88 px-3.5 py-1.5 text-xs font-bold text-neutral-600 shadow-sm ring-1 ring-black/[0.02]"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="relative grid gap-4 lg:grid-cols-3">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 hidden h-[min(100%,480px)] w-[min(100%,720px)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(29,111,130,0.1),transparent_68%)] lg:block"
            aria-hidden
          />
          <div className="relative z-[1]">
            <PricingCard name="Старт" price={yearly ? "0 ₽" : "0 ₽"} text="Тест ниши, базовая витрина и мастер запуска." href="/onboarding?plan=start" />
          </div>
          <div className="relative z-[1]">
            <PricingCard name="Рост" price={yearly ? "2 320 ₽" : "2 900 ₽"} text="Лучший для растущего бизнеса: расширенный кабинет, AI-улучшения и больше шаблонов." featured href="/onboarding?plan=growth" />
          </div>
          <div className="relative z-[1]">
            <PricingCard name="Бизнес" price={yearly ? "6 320 ₽" : "7 900 ₽"} text="Командная работа, несколько витрин и приоритетная поддержка." href="/onboarding?plan=business" />
          </div>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {["SSL и безопасный хостинг", "Регулярные резервные копии", "Поддержка запуска 7/7"].map((note) => (
            <div
              key={note}
              className="rounded-2xl border border-line/75 bg-gradient-to-br from-white/96 to-white/88 p-4 text-sm font-semibold text-neutral-600 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] ring-1 ring-black/[0.02] transition duration-200 ease-premium hover:border-sea/20"
            >
              {note}
            </div>
          ))}
        </div>
      </Section>
      <Section eyebrow="FAQ" title="Ответы по тарифам">
        <div className="grid gap-3">
          {faq.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-line/90 bg-white/95 shadow-soft ring-1 ring-white/50 transition duration-200 ease-premium hover:border-sea/20 open:border-sea/20 open:shadow-premium">
              <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-3">
                  {item.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-line/90 bg-paper text-sm font-bold text-neutral-500 transition duration-200 ease-premium group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="border-t border-line/90 px-5 pb-4 pt-0 text-sm leading-7 text-neutral-600">{item.a}</p>
            </details>
          ))}
        </div>
      </Section>
      <section className="shell pb-16 md:pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink via-[#121826] to-sea p-8 text-white shadow-[0_36px_100px_rgba(10,13,18,0.42),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/10 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_45%_at_85%_20%,rgba(139,50,88,0.22),transparent_55%)]" aria-hidden />
          <h2 className="relative max-w-xl text-2xl font-extrabold leading-tight tracking-[-0.03em] md:text-3xl">Выберите план — сменить его можно в один клик</h2>
          <p className="relative mt-3 max-w-lg text-sm leading-7 text-white/75">Старт бесплатно. Когда поймёте продуктовый ритм, переходите на «Рост» или «Бизнес».</p>
          <div className="relative mt-6 flex flex-wrap gap-3">
            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-ink shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition duration-200 ease-premium hover:-translate-y-0.5 hover:bg-neutral-100 active:translate-y-0"
            >
              Начать с «Старт»
            </Link>
            <Link
              href="/features"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/28 bg-white/5 px-5 text-sm font-semibold backdrop-blur-sm transition duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/12 active:translate-y-0"
            >
              Все возможности
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
