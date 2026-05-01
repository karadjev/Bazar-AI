import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { FeatureCard, Footer, Header, PricingCard, Section, StepCard, StorePreviewCard } from "@/components/ui-kit";
import { storefrontThemes } from "@/lib/themes";

const steps = [
  { title: "Ответьте на 6 шагов", text: "Ниша, город, контакты, стиль и запуск." },
  { title: "AI создает витрину", text: "Готовый первый экран, каталог, блоки доверия и CTA." },
  { title: "Поделитесь ссылкой", text: "Получайте заявки в Telegram/WhatsApp с первого дня." }
];
const examples = [storefrontThemes[3], storefrontThemes[0], storefrontThemes[2], storefrontThemes[4], storefrontThemes[6], storefrontThemes[9]];
const faq = [
  "Нужен ли разработчик для запуска?",
  "Можно ли принимать заказы в Telegram?",
  "Есть ли мобильная версия storefront?",
  "Можно ли редактировать тексты без кода?"
];
const socialProof = [
  "120+ магазинов создано",
  "Оценка 4.9/5",
  "Локальный бизнес рекомендует"
];
const trustPoints = ["Готово к безопасному checkout", "Оптимизировано для mobile", "Без кода", "Для малого бизнеса"];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <Header />
      <section className="shell grid gap-10 py-10 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-neutral-600">AI-платформа витрин для локального бизнеса</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
            Создай магазин за 5 минут и получай заявки без кода
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600">
            BuildYourStore.ai для малого бизнеса: витрина + онбординг + кабинет в одном продукте. Выглядит как премиум-сервис и запускается в тот же день.
          </p>
          <p className="mt-3 text-sm font-semibold text-neutral-700">Что это? Платформа витрин. Для кого? Локальный бизнес. Что получу? Готовый магазин и заявки.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/onboarding" className="inline-flex h-12 items-center justify-center rounded-2xl bg-ink px-5 text-sm font-semibold text-white">
              Создать магазин
            </Link>
            <Link href="/templates" className="inline-flex h-12 items-center justify-center rounded-2xl border border-line bg-white px-5 text-sm font-semibold">
              Смотреть шаблоны
            </Link>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {socialProof.map((item) => (
              <div key={item} className="rounded-2xl border border-line bg-white px-3 py-3 text-xs font-semibold text-neutral-600">{item}</div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {trustPoints.map((item) => (
              <span key={item} className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-neutral-600">{item}</span>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-line bg-white p-4 shadow-premium md:p-6">
          <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-violet-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white/80">Живой предпросмотр</p>
              <span className="rounded-full bg-white/15 px-2 py-1 text-[11px] font-semibold">новая заявка</span>
            </div>
            <p className="mt-2 text-2xl font-semibold">Oud House</p>
            <p className="mt-2 text-sm text-white/80">Премиальная парфюмерная витрина</p>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold"><span>Oud Classic 50ml</span><span>4 500 ₽</span></div>
              <div className="flex items-center justify-between rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold"><span>Amber Gift Set</span><span>7 200 ₽</span></div>
              <div className="h-10 rounded-xl bg-emerald-400/90" />
            </div>
          </div>
          <Link href="/store/oud-house" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-neutral-700">
            Открыть демо-магазин <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Section eyebrow="Скриншоты продукта" title="Реальные экраны продукта, а не абстракция" text="Кабинет, витрина и онбординг в живом формате.">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { title: "Скриншот кабинета", image: storefrontThemes[6].image },
            { title: "Скриншот витрины", image: storefrontThemes[3].image },
            { title: "Скриншот онбординга", image: storefrontThemes[1].image }
          ].map((item) => (
            <article key={item.title} className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-premium">
              <div className="relative aspect-[4/3]">
                <Image src={item.image} alt={item.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 380px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <p className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold text-neutral-700">{item.title}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="how" eyebrow="Как это работает" title="Простой путь от идеи до продаж" text="Мастер запуска, генерация витрины и моментальный старт без ручной верстки.">
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((item, index) => (
            <StepCard key={item.title} index={index + 1} title={item.title} text={item.text} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Ниши" title="Парфюм, мода, халяль-продукты, выпечка">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["Парфюм", "Мода", "Халяль-продукты", "Выпечка"].map((item) => (
            <div key={item} className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <p className="text-lg font-semibold">{item}</p>
              <p className="mt-2 text-sm text-neutral-600">Готовые блоки и контент под нишу.</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Преимущества" title="Что делает продукт SaaS-уровня">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard title="AI-витрина" text="Генерация структуры, текстов и визуальных блоков." />
          <FeatureCard title="Mobile-first" text="Карточки и checkout оптимизированы под смартфон." />
          <FeatureCard title="Сбор заявок" text="Заявки и контакты приходят без лишних шагов." />
          <FeatureCard title="Без кода" text="Изменения через кабинет и мастер запуска." />
          <FeatureCard title="Под нишу" text="Стиль и UX адаптируются под конкретную нишу." />
          <FeatureCard title="Быстрый запуск" text="Сайт доступен за минуты, а не за недели." />
        </div>
      </Section>

      <Section eyebrow="Для кого" title="BuildYourStore.ai подходит тем, кому нужен результат, а не конструктор">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Локальные бренды", "Нужен быстрый запуск витрины и лиды без найма команды."],
            ["Малые eCom-команды", "Нужен быстрый выход в новые ниши и города."],
            ["Агенты и фрилансеры", "Нужно запускать клиентам витрины в повторяемом формате."]
          ].map(([title, text]) => (
            <FeatureCard key={title} title={title} text={text} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Сравнение" title="Сайт самому vs BuildYourStore.ai">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="text-lg font-semibold">Сайт самому</p>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li>2-6 недель на дизайн, верстку и сборку воронки</li>
              <li>Отдельно подключение сбора заявок и CRM</li>
              <li>Сложный mobile polish и UX-контроль</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-ink bg-ink p-5 text-white">
            <p className="text-lg font-semibold">BuildYourStore.ai</p>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>Запуск витрины за минуты через мастер запуска</li>
              <li>Готовые заявки и dashboard из коробки</li>
              <li>Mobile-first UX и готовые ниши/шаблоны</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section id="stores" eyebrow="Предпросмотр" title="Смотрите витрину до публикации">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {examples.map((theme) => (
            <StorePreviewCard key={theme.code} title={theme.title} city={theme.category} image={theme.image} accent={theme.accent} />
          ))}
        </div>
      </Section>

      <Section id="pricing" eyebrow="Тарифы" title="Прозрачные планы для роста">
        <div className="grid gap-4 lg:grid-cols-3">
          <PricingCard name="Старт" price="0 ₽" text="Для запуска первой ниши и теста канала продаж." />
          <PricingCard name="Рост" price="2 900 ₽" text="Для постоянного потока заявок и редактирования витрины." featured />
          <PricingCard name="Бизнес" price="7 900 ₽" text="Для команд, нескольких витрин и приоритетной поддержки." />
        </div>
      </Section>

      <Section eyebrow="Вопросы" title="Частые вопросы">
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
          <h3 className="max-w-2xl text-3xl font-semibold md:text-5xl">Запустите витрину и примите первый заказ сегодня</h3>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/onboarding" className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-ink">Создать магазин</Link>
            <Link href="/store/oud-house" className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 px-5 text-sm font-semibold">Открыть демо</Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
