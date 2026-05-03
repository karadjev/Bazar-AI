"use client";

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
    <main className="min-h-screen bg-paper text-ink" data-testid="page-pricing">
      <Header />
      <Section eyebrow="Тарифы" title="Планы для старта и масштабирования" text="Без скрытых платежей, с понятными лимитами и быстрым стартом.">
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-line bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-2xl border border-line bg-paper p-1">
            <button type="button" onClick={() => setBilling("monthly")} className={`focus-ring h-9 rounded-xl px-3 text-sm font-semibold transition duration-200 ${billing === "monthly" ? "bg-ink text-white" : "hover:bg-white/80"}`}>Помесячно</button>
            <button type="button" onClick={() => setBilling("yearly")} className={`focus-ring h-9 rounded-xl px-3 text-sm font-semibold transition duration-200 ${billing === "yearly" ? "bg-ink text-white" : "hover:bg-white/80"}`}>За год -20%</button>
          </div>
          <p className="text-xs font-semibold text-neutral-500">Без комиссии за заявки</p>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {["Гарантия 14 дней", "Можно отменить в любой момент", "Без скрытых платежей"].map((item) => (
            <span key={item} className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-neutral-600">{item}</span>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <PricingCard name="Старт" price={yearly ? "0 ₽" : "0 ₽"} text="Тест ниши, базовая витрина и мастер запуска." href="/onboarding?plan=start" />
          <PricingCard name="Рост" price={yearly ? "2 320 ₽" : "2 900 ₽"} text="Лучший для растущего бизнеса: расширенный кабинет, AI-улучшения и больше шаблонов." featured href="/onboarding?plan=growth" />
          <PricingCard name="Бизнес" price={yearly ? "6 320 ₽" : "7 900 ₽"} text="Командная работа, несколько витрин и приоритетная поддержка." href="/onboarding?plan=business" />
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {["SSL и безопасный хостинг", "Регулярные резервные копии", "Поддержка запуска 7/7"].map((note) => (
            <div key={note} className="rounded-2xl border border-line bg-white p-4 text-sm font-semibold text-neutral-600">{note}</div>
          ))}
        </div>
      </Section>
      <Section eyebrow="FAQ" title="Ответы по тарифам">
        <div className="grid gap-3">
          {faq.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-line bg-white shadow-soft transition duration-200 hover:border-neutral-200 open:border-neutral-200 open:shadow-premium">
              <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-3">
                  {item.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-line bg-paper text-sm font-bold text-neutral-500 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="border-t border-line px-5 pb-4 pt-0 text-sm leading-7 text-neutral-600">{item.a}</p>
            </details>
          ))}
        </div>
      </Section>
      <Footer />
    </main>
  );
}
