import { FeatureCard, Footer, Header, Section } from "@/components/ui-kit";

const featureList = [
  ["AI-создание витрины", "Генерация первого экрана, карточек, офферов и CTA под ваш бизнес."],
  ["Дизайн под нишу", "Отдельные стили и контент для разных категорий товаров."],
  ["Готовый checkout-layout", "Быстрый путь к заявке и заказу уже встроен в витрину."],
  ["Сбор заявок продавца", "Контакты клиентов и заявки сразу попадают в кабинет."],
  ["Mobile-first страницы", "Интерфейс и сетка сначала оптимизированы для смартфона."],
  ["Редактирование без кода", "Управление витриной через мастер запуска и кабинет."]
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <Header />
      <Section eyebrow="Возможности" title="Все, что нужно для запуска витрины">
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          {["5 минут до первого варианта", "Mobile-first интерфейс из коробки", "Заявки + кабинет"].map((item) => (
            <div key={item} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-neutral-600">{item}</div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureList.map(([title, text]) => (
            <FeatureCard key={title} title={title} text={text} />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <a href="/onboarding" className="inline-flex h-11 items-center rounded-2xl bg-ink px-4 text-sm font-semibold text-white">Создать магазин</a>
          <a href="/templates" className="inline-flex h-11 items-center rounded-2xl border border-line bg-white px-4 text-sm font-semibold">Смотреть шаблоны</a>
        </div>
      </Section>
      <Footer />
    </main>
  );
}
