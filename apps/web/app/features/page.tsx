import { FeatureCard, Footer, Header, Section } from "@/components/ui-kit";

const featureList = [
  ["AI-generated storefront", "Генерация hero, карточек, офферов и CTA под ваш бизнес."],
  ["Niche-specific design", "Отдельные стили и контент для разных категорий товаров."],
  ["Checkout-ready layout", "Быстрый путь к заявке и заказу уже встроен в storefront."],
  ["Seller lead capture", "Контакты клиентов и заявки сразу попадают продавцу."],
  ["Mobile-first pages", "UX и сетка сначала оптимизированы для смартфона."],
  ["No-code editing", "Редактирование витрины через onboarding и dashboard без кода."]
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <Header />
      <Section eyebrow="Features" title="Все, что нужно для запуска storefront">
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          {["5 минут до первого варианта", "Mobile-first UX из коробки", "Lead capture + dashboard"].map((item) => (
            <div key={item} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-neutral-600">{item}</div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureList.map(([title, text]) => (
            <FeatureCard key={title} title={title} text={text} />
          ))}
        </div>
      </Section>
      <Footer />
    </main>
  );
}
