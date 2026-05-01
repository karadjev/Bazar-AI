import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FeatureCard, Footer, Header, PricingCard, Section, StepCard, StorePreviewCard } from "@/components/ui-kit";
import { storefrontThemes } from "@/lib/themes";

const steps = [
  { title: "Ответьте на 6 шагов", text: "Ниша, город, контакты, стиль и запуск." },
  { title: "AI создает storefront", text: "Готовый hero, каталог, trust-блоки и CTA." },
  { title: "Поделитесь ссылкой", text: "Получайте заявки в Telegram/WhatsApp с первого дня." }
];
const examples = [storefrontThemes[3], storefrontThemes[0], storefrontThemes[2], storefrontThemes[4], storefrontThemes[6], storefrontThemes[9]];
const faq = [
  "Нужен ли разработчик для запуска?",
  "Можно ли принимать заказы в Telegram?",
  "Есть ли мобильная версия storefront?",
  "Можно ли редактировать тексты без кода?"
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <Header />
      <section className="shell grid gap-10 py-14 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold text-neutral-500">AI storefront platform</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
            Запускайте premium-магазин как продукт, а не как шаблон
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600">
            BuildYourStore.ai генерирует storefront под нишу, подготавливает mobile-first checkout и помогает принимать заявки без команды разработки.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/onboarding" className="inline-flex h-12 items-center justify-center rounded-2xl bg-ink px-5 text-sm font-semibold text-white">
              Создать магазин
            </Link>
            <Link href="/templates" className="inline-flex h-12 items-center justify-center rounded-2xl border border-line bg-white px-5 text-sm font-semibold">
              Смотреть примеры
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-line bg-white p-6 shadow-premium">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-violet-700 p-6 text-white">
            <p className="text-xs font-semibold text-white/80">Live preview</p>
            <p className="mt-2 text-2xl font-semibold">Oud House</p>
            <p className="mt-2 text-sm text-white/80">Luxury Perfume storefront</p>
            <div className="mt-6 grid gap-2">
              <div className="h-10 rounded-xl bg-white/20" />
              <div className="h-10 rounded-xl bg-white/20" />
              <div className="h-10 rounded-xl bg-white/20" />
            </div>
          </div>
          <Link href="/store/oud-house" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-neutral-700">
            Открыть storefront <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Section id="how" eyebrow="Как это работает" title="Простой flow от идеи до продаж" text="Wizard, генерация витрины и моментальный запуск без ручной верстки.">
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((item, index) => (
            <StepCard key={item.title} index={index + 1} title={item.title} text={item.text} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Ниши" title="Perfume, Fashion, Halal Grocery, Bakery">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["Perfume", "Fashion", "Halal Grocery", "Bakery"].map((item) => (
            <div key={item} className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <p className="text-lg font-semibold">{item}</p>
              <p className="mt-2 text-sm text-neutral-600">Готовые блоки и контент под нишу.</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Преимущества" title="Что делает продукт SaaS-уровня">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard title="AI storefront" text="Генерация структуры, текста и visual блоков." />
          <FeatureCard title="Mobile-first" text="Карточки и checkout оптимизированы под смартфон." />
          <FeatureCard title="Lead capture" text="Заявки и контакты приходят без лишних шагов." />
          <FeatureCard title="No-code edits" text="Изменения через dashboard и onboarding wizard." />
          <FeatureCard title="Niche-ready" text="Стиль и UX адаптируются под конкретную нишу." />
          <FeatureCard title="Fast launch" text="Сайт доступен за минуты, а не за недели." />
        </div>
      </Section>

      <Section id="stores" eyebrow="Live previews" title="Смотрите storefront до публикации">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {examples.map((theme) => (
            <StorePreviewCard key={theme.code} title={theme.title} city={theme.category} image={theme.image} accent={theme.accent} />
          ))}
        </div>
      </Section>

      <Section id="pricing" eyebrow="Pricing teaser" title="Прозрачные планы для роста">
        <div className="grid gap-4 lg:grid-cols-3">
          <PricingCard name="Starter" price="0 ₽" text="Для запуска первой ниши и теста канала продаж." />
          <PricingCard name="Pro" price="2 900 ₽" text="Для постоянного потока заявок и редактирования витрины." featured />
          <PricingCard name="Business" price="7 900 ₽" text="Для команд, нескольких storefront и приоритетной поддержки." />
        </div>
      </Section>

      <Section eyebrow="FAQ" title="Частые вопросы">
        <div className="grid gap-3">
          {faq.map((item) => (
            <div key={item} className="rounded-2xl border border-line bg-white p-5">
              <p className="text-base font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="shell pb-16">
        <div className="rounded-3xl bg-ink p-8 text-white md:p-12">
          <h3 className="max-w-2xl text-3xl font-semibold md:text-5xl">Запустите storefront и примите первый заказ сегодня</h3>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/onboarding" className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-ink">Создать магазин</Link>
            <Link href="/store/oud-house" className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 px-5 text-sm font-semibold">Открыть demo</Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
