import type { Metadata } from "next";
import Link from "next/link";
import { FeatureCard, Footer, Header, Section } from "@/components/ui-kit";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Возможности",
  description: "AI-витрина, mobile-first, заявки в кабинет, редактор без кода. Всё для запуска локального магазина.",
  path: "/features"
});

const featureFaq: Array<{ q: string; a: string }> = [
  {
    q: "Сколько времени занимает первый запуск?",
    a: "Обычно 5–15 минут: мастер запуска, предпросмотр и публикация ссылки. Дальше вы наполняете товары и делитесь витриной."
  },
  {
    q: "Нужен ли отдельный хостинг?",
    a: "Для локальной разработки можно поднять Docker-стек из репозитория. Для продакшена используйте готовый compose и runbook деплоя."
  },
  {
    q: "Как выглядит путь клиента?",
    a: "Клиент открывает витрину, выбирает товар или услугу и оставляет заявку. Вы видите контакт в кабинете и можете сразу ответить в мессенджере."
  }
];

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
    <main className="min-h-screen bg-paper text-ink" data-testid="page-features">
      <Header />
      <Section eyebrow="Возможности" title="Все, что нужно для запуска витрины">
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          {["5 минут до первого варианта", "Mobile-first интерфейс из коробки", "Заявки + кабинет"].map((item) => (
            <div key={item} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-neutral-600 shadow-sm transition duration-200 hover:border-neutral-200">{item}</div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureList.map(([title, text]) => (
            <FeatureCard key={title} title={title} text={text} />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/onboarding" className="inline-flex h-11 items-center rounded-2xl bg-ink px-4 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(13,17,23,0.2)] transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0">Создать магазин</Link>
          <Link href="/templates" className="inline-flex h-11 items-center rounded-2xl border border-line bg-white px-4 text-sm font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50 active:translate-y-0">Смотреть шаблоны</Link>
          <Link href="/dashboard" className="inline-flex h-11 items-center rounded-2xl border border-line bg-white px-4 text-sm font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50 active:translate-y-0">Открыть кабинет</Link>
        </div>
      </Section>
      <Section eyebrow="FAQ" title="Коротко о возможностях">
        <div className="grid gap-3">
          {featureFaq.map((item) => (
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
