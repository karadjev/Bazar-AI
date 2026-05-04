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
    <main className="relative min-h-screen overflow-x-hidden bg-paper text-ink premium-grid" data-testid="page-features">
      <Header />
      <section className="shell relative pb-4 pt-8 md:pb-8 md:pt-14">
        <div
          className="hero-ambient -left-28 top-4 hidden h-[400px] w-[400px] bg-gradient-to-br from-sea/32 via-berry/14 to-transparent lg:block"
          aria-hidden
        />
        <div
          className="hero-ambient right-[-100px] top-28 hidden h-[300px] w-[300px] bg-gradient-to-tl from-saffron/22 via-sea/12 to-transparent lg:block"
          aria-hidden
        />
        <div className="relative z-[1] max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-gradient-to-r from-white/95 to-white/85 px-4 py-2 text-xs font-bold text-neutral-700 shadow-[0_1px_0_rgba(255,255,255,1)_inset,0_12px_40px_rgba(29,111,130,0.1)] ring-1 ring-sea/10 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-sea shadow-[0_0_10px_rgba(29,111,130,0.6)]" aria-hidden />
            Каталог возможностей
          </p>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-[-0.035em] md:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
            Всё для{" "}
            <span className="bg-gradient-to-r from-sea via-berry to-saffron bg-clip-text text-transparent drop-shadow-[0_2px_20px_rgba(29,111,130,0.15)]">
              идеальной витрины
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg md:leading-8">
            AI, mobile-first, заявки в кабинет и правки без кода — в одном спокойном, «дорогом» продуктовом слое.
          </p>
        </div>
      </section>
      <Section eyebrow="Модули" title="Все, что нужно для запуска витрины" className="!pt-4 md:!pt-6">
        <div className="mb-8 grid gap-3 md:grid-cols-3">
          {["5 минут до первого варианта", "Mobile-first интерфейс из коробки", "Заявки + кабинет"].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-line/75 bg-gradient-to-b from-white/96 to-white/88 px-4 py-3.5 text-sm font-semibold text-neutral-600 shadow-[0_1px_0_rgba(255,255,255,0.92)_inset] ring-1 ring-black/[0.02] transition duration-200 ease-premium hover:border-sea/28 hover:shadow-glowSoft"
            >
              {item}
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureList.map(([title, text]) => (
            <FeatureCard key={title} title={title} text={text} />
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/onboarding"
            className="inline-flex h-12 items-center rounded-2xl bg-gradient-to-r from-ink via-[#121826] to-sea px-5 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(10,13,18,0.3),0_0_36px_-8px_rgba(29,111,130,0.35)] transition duration-200 ease-premium hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
          >
            Создать магазин
          </Link>
          <Link
            href="/templates"
            className="inline-flex h-12 items-center rounded-2xl border border-line/90 bg-white/95 px-5 text-sm font-semibold shadow-[0_12px_36px_rgba(10,13,18,0.06)] ring-1 ring-white/80 transition duration-200 ease-premium hover:-translate-y-0.5 hover:border-sea/22 hover:bg-white active:translate-y-0"
          >
            Смотреть шаблоны
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center rounded-2xl border border-line/90 bg-white/95 px-5 text-sm font-semibold shadow-[0_12px_36px_rgba(10,13,18,0.06)] ring-1 ring-white/80 transition duration-200 ease-premium hover:-translate-y-0.5 hover:border-sea/22 hover:bg-white active:translate-y-0"
          >
            Открыть кабинет
          </Link>
        </div>
      </Section>
      <Section eyebrow="FAQ" title="Коротко о возможностях">
        <div className="grid gap-3">
          {featureFaq.map((item) => (
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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_15%_0%,rgba(29,111,130,0.38),transparent_55%)]" aria-hidden />
          <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-berry/25 blur-3xl" aria-hidden />
          <h2 className="relative max-w-xl text-2xl font-extrabold leading-tight tracking-[-0.03em] md:text-3xl">
            Готовы собрать витрину, от которой не отводят глаза?
          </h2>
          <div className="relative mt-6 flex flex-wrap gap-3">
            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-ink shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition duration-200 ease-premium hover:-translate-y-0.5 hover:bg-neutral-100 active:translate-y-0"
            >
              Запустить мастер
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/28 bg-white/5 px-5 text-sm font-semibold backdrop-blur-sm transition duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/12 active:translate-y-0"
            >
              Смотреть тарифы
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
