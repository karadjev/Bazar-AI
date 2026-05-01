import { Footer, Header, PricingCard, Section } from "@/components/ui-kit";

const faq = [
  "Можно ли перейти со Starter на Pro без потери данных?",
  "Есть ли комиссия за заявки и заказы?",
  "Поддерживается ли несколько storefront на одном аккаунте?",
  "Можно ли кастомизировать бренд и домен?"
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <Header />
      <Section eyebrow="Pricing" title="Планы для старта и масштабирования" text="Без скрытых платежей, с понятными лимитами и быстрым стартом.">
        <div className="grid gap-4 lg:grid-cols-3">
          <PricingCard name="Starter" price="0 ₽" text="Тест ниши, базовый storefront и onboarding." />
          <PricingCard name="Pro" price="2 900 ₽" text="Расширенный dashboard, AI улучшения и больше шаблонов." featured />
          <PricingCard name="Business" price="7 900 ₽" text="Командная работа, несколько витрин и приоритетная поддержка." />
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
