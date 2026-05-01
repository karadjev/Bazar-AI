"use client";

import { useState } from "react";
import { Footer, Header, PricingCard, Section } from "@/components/ui-kit";

const faq = [
  "Можно ли перейти со Starter на Pro без потери данных?",
  "Есть ли комиссия за заявки и заказы?",
  "Поддерживается ли несколько storefront на одном аккаунте?",
  "Можно ли кастомизировать бренд и домен?"
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const yearly = billing === "yearly";

  return (
    <main className="min-h-screen bg-paper text-ink">
      <Header />
      <Section eyebrow="Pricing" title="Планы для старта и масштабирования" text="Без скрытых платежей, с понятными лимитами и быстрым стартом.">
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-line bg-white p-3">
          <div className="inline-flex rounded-2xl border border-line bg-paper p-1">
            <button onClick={() => setBilling("monthly")} className={`h-9 rounded-xl px-3 text-sm font-semibold ${billing === "monthly" ? "bg-ink text-white" : ""}`}>Monthly</button>
            <button onClick={() => setBilling("yearly")} className={`h-9 rounded-xl px-3 text-sm font-semibold ${billing === "yearly" ? "bg-ink text-white" : ""}`}>Yearly -20%</button>
          </div>
          <p className="text-xs font-semibold text-neutral-500">Без комиссии за заявки</p>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {["Guarantee 14 days", "Cancel anytime", "No hidden fees"].map((item) => (
            <span key={item} className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-neutral-600">{item}</span>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <PricingCard name="Starter" price={yearly ? "0 ₽" : "0 ₽"} text="Тест ниши, базовый storefront и onboarding." />
          <PricingCard name="Pro" price={yearly ? "2 320 ₽" : "2 900 ₽"} text="Best for growing business: расширенный dashboard, AI улучшения и больше шаблонов." featured />
          <PricingCard name="Business" price={yearly ? "6 320 ₽" : "7 900 ₽"} text="Командная работа, несколько витрин и приоритетная поддержка." />
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {["SSL + secure hosting", "Регулярные backup", "Поддержка запуска 7/7"].map((note) => (
            <div key={note} className="rounded-2xl border border-line bg-white p-4 text-sm font-semibold text-neutral-600">{note}</div>
          ))}
        </div>
      </Section>
      <Section eyebrow="FAQ" title="Ответы по тарифам">
        <div className="grid gap-3">
          {faq.map((item) => (
            <div key={item} className="rounded-2xl border border-line bg-white p-5 text-sm font-semibold">
              {item}
            </div>
          ))}
        </div>
      </Section>
      <Footer />
    </main>
  );
}
