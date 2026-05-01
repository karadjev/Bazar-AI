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
