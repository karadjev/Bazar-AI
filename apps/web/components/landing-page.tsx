import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { FeatureCard, Footer, Header, PricingCard, Section, StepCard, StorePreviewCard } from "@/components/ui-kit";
import { storefrontThemesLite } from "@/lib/themes-lite";

const steps = [
  { title: "Ответьте на 6 шагов", text: "Ниша, город, контакты, стиль и запуск." },
  { title: "AI создает витрину", text: "Готовый первый экран, каталог, блоки доверия и CTA." },
  { title: "Поделитесь ссылкой", text: "Получайте заявки в Telegram/WhatsApp с первого дня." }
];
const examples = [storefrontThemesLite[3], storefrontThemesLite[0], storefrontThemesLite[2], storefrontThemesLite[4], storefrontThemesLite[6], storefrontThemesLite[9]];
const faq: Array<{ q: string; a: string }> = [
  {
    q: "Нужен ли разработчик для запуска?",
    a: "Нет. Мастер запуска собирает витрину и ссылку, а кабинет помогает вести заявки и товары без кода."
  },
  {
    q: "Можно ли принимать заказы в Telegram?",
    a: "Да. Контакты Telegram и WhatsApp встраиваются в витрину, а заявки попадают в кабинет."
  },
  {
    q: "Есть ли мобильная версия storefront?",
    a: "Да. Сетка и карточки изначально заточены под смартфон: крупные CTA, понятные блоки доверия и быстрый заказ."
  },
  {
    q: "Можно ли редактировать тексты без кода?",
    a: "Да. Тексты и акценты меняются через мастер и кабинет, а редактор витрины помогает быстро подкрутить оффер."
  }
];
const socialProof = [
  "120+ магазинов создано",
  "Оценка 4.9/5",
  "Локальный бизнес рекомендует"
];
const trustPoints = ["Готово к безопасному checkout", "Оптимизировано для mobile", "Без кода", "Для малого бизнеса"];

export function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-paper text-ink premium-grid" data-testid="page-home">
      <Header />
      <section className="shell relative grid gap-10 py-12 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16" aria-label="Первый экран">
        <div
          className="hero-ambient -left-32 top-0 hidden h-[420px] w-[420px] bg-gradient-to-br from-sea/35 via-berry/20 to-saffron/15 lg:block"
          aria-hidden
        />
        <div
          className="hero-ambient right-[-120px] top-24 hidden h-[340px] w-[340px] bg-gradient-to-tl from-berry/25 via-sea/15 to-transparent lg:block"
          aria-hidden
        />
        <div className="relative z-[1]">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-gradient-to-r from-white/95 to-white/85 px-4 py-2 text-xs font-bold text-neutral-700 shadow-[0_1px_0_rgba(255,255,255,1)_inset,0_12px_40px_rgba(29,111,130,0.12),0_4px_16px_rgba(10,13,18,0.04)] ring-1 ring-sea/10 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint/70 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mint shadow-[0_0_12px_rgba(61,143,98,0.65)]" />
            </span>
            AI-платформа витрин для локального бизнеса
          </p>
          <h1 className="mt-7 max-w-3xl text-4xl font-extrabold leading-[1.06] tracking-[-0.035em] md:text-[3.35rem] md:leading-[1.04] lg:text-[3.65rem]">
            Создай магазин за{" "}
            <span className="relative inline bg-gradient-to-r from-sea via-berry to-saffron bg-clip-text text-transparent drop-shadow-[0_2px_24px_rgba(29,111,130,0.18)]">
              5 минут
            </span>{" "}
            <span className="text-ink">и получай заявки без кода</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg md:leading-8">
            BuildYourStore.ai для малого бизнеса: витрина + онбординг + кабинет в одном продукте. Выглядит как премиум-сервис и запускается в тот же день.
          </p>
          <p className="mt-5 rounded-2xl border border-line/70 bg-gradient-to-br from-white/90 to-white/70 px-4 py-3.5 text-sm font-semibold leading-relaxed text-neutral-700 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset] ring-1 ring-black/[0.03] backdrop-blur-md">
            Что это? Платформа витрин. Для кого? Локальный бизнес. Что получу? Готовый магазин и заявки.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-ink via-[#121826] to-sea px-6 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(10,13,18,0.32),0_0_40px_-8px_rgba(29,111,130,0.35)] transition duration-200 ease-premium hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
            >
              Создать магазин
            </Link>
            <Link
              href="/templates"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-line/90 bg-white/95 px-6 text-sm font-semibold shadow-[0_12px_36px_rgba(10,13,18,0.06)] ring-1 ring-white/80 transition duration-200 ease-premium hover:-translate-y-0.5 hover:border-sea/20 hover:bg-white active:translate-y-0"
            >
              Смотреть шаблоны
            </Link>
          </div>
          <ul className="mt-6 grid gap-2 sm:grid-cols-3" aria-label="Социальное доказательство">
            {socialProof.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-line/75 bg-gradient-to-b from-white/95 to-white/88 px-3 py-3.5 text-center text-xs font-bold text-neutral-700 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] ring-1 ring-black/[0.02] backdrop-blur-sm transition duration-200 ease-premium hover:border-sea/30 hover:shadow-glowSoft"
              >
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {trustPoints.map((item) => (
              <span
                key={item}
                className="rounded-full border border-dashed border-line/80 bg-white/85 px-3 py-1.5 text-xs font-semibold text-neutral-600 shadow-sm backdrop-blur-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="relative z-[1]">
          <div className="absolute -inset-3 rounded-[1.85rem] bg-gradient-to-br from-sea/30 via-white/40 to-berry/25 opacity-90 blur-2xl" aria-hidden />
          <div className="relative rounded-[1.65rem] bg-gradient-to-br from-sea/20 via-line/30 to-berry/20 p-[1px] shadow-glowSea">
            <div className="surface-elevated relative rounded-[1.6rem] border border-white/60 bg-white/[0.93] p-4 shadow-ultra ring-1 ring-white/70 transition duration-200 ease-premium hover:border-sea/15 md:p-6">
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90" aria-hidden />
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1220] via-slate-900 to-[#2d1f4e] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_24px_60px_rgba(0,0,0,0.35)] ring-1 ring-white/15">
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sea/30 blur-3xl" aria-hidden />
                <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-berry/25 blur-3xl" aria-hidden />
                <div className="relative flex items-center justify-between">
                  <p className="text-xs font-semibold tracking-wide text-white/85">Живой предпросмотр</p>
                  <span className="rounded-full border border-white/15 bg-white/12 px-2.5 py-1 text-[11px] font-semibold text-white/95 shadow-inner">новая заявка</span>
                </div>
                <p className="relative mt-3 text-2xl font-semibold tracking-tight">Oud House</p>
                <p className="relative mt-2 text-sm text-white/78">Премиальная парфюмерная витрина</p>
                <div className="relative mt-6 space-y-2">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/12 px-3 py-2 text-xs font-semibold backdrop-blur-sm">
                    <span>Oud Classic 50ml</span>
                    <span className="tabular-nums text-white/95">4 500 ₽</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/12 px-3 py-2 text-xs font-semibold backdrop-blur-sm">
                    <span>Amber Gift Set</span>
                    <span className="tabular-nums text-white/95">7 200 ₽</span>
                  </div>
                  <div className="h-11 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-semibold text-slate-950 shadow-[0_14px_36px_rgba(16,185,129,0.4),inset_0_1px_0_rgba(255,255,255,0.45)]" />
                </div>
              </div>
              <Link
                href="/store/oud-house"
                className="group mt-5 inline-flex items-center gap-2 text-sm font-bold text-neutral-800 transition duration-200 ease-premium hover:gap-3 hover:text-ink"
              >
                Открыть демо-магазин <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-200 ease-premium group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Section eyebrow="Скриншоты продукта" title="Реальные экраны продукта, а не абстракция" text="Кабинет, витрина и онбординг в живом формате.">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { title: "Скриншот кабинета", image: storefrontThemesLite[6].image },
            { title: "Скриншот витрины", image: storefrontThemesLite[3].image },
            { title: "Скриншот онбординга", image: storefrontThemesLite[1].image }
          ].map((item) => (
            <article key={item.title} className="overflow-hidden rounded-2xl border border-line/90 bg-white/95 shadow-soft ring-1 ring-white/50 transition duration-200 ease-premium hover:-translate-y-1 hover:border-sea/20 hover:shadow-premium">
              <div className="relative aspect-[4/3]">
                <Image src={item.image} alt={item.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 380px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <p className="absolute bottom-3 left-3 rounded-xl bg-white/92 px-2.5 py-1 text-xs font-semibold text-neutral-700 shadow-sm ring-1 ring-black/[0.04]">{item.title}</p>
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
            <div key={item} className="rounded-2xl border border-line/90 bg-white/95 p-5 shadow-soft ring-1 ring-white/50 transition duration-200 ease-premium hover:-translate-y-0.5 hover:border-sea/20 hover:shadow-premium">
              <p className="text-lg font-semibold tracking-tight">{item}</p>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Готовые блоки и контент под нишу.</p>
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
          <div className="rounded-2xl border border-line/90 bg-white/95 p-5 shadow-sm ring-1 ring-white/50 transition duration-200 ease-premium hover:border-sea/20">
            <p className="text-lg font-semibold tracking-tight">Сайт самому</p>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li>2-6 недель на дизайн, верстку и сборку воронки</li>
              <li>Отдельно подключение сбора заявок и CRM</li>
              <li>Сложный mobile polish и UX-контроль</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-ink via-[#121826] to-[#1a2744] p-5 text-white shadow-[0_28px_80px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/10">
            <p className="text-lg font-semibold tracking-tight">BuildYourStore.ai</p>
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
            <StorePreviewCard
              key={theme.code}
              title={theme.title}
              city={theme.category}
              image={theme.image}
              accent={theme.accent}
              href={`/onboarding?style=${encodeURIComponent(theme.code)}&niche=${encodeURIComponent(theme.category)}&name=${encodeURIComponent(theme.title)}&city=${encodeURIComponent("Магас")}`}
            />
          ))}
        </div>
      </Section>

      <Section id="pricing" eyebrow="Тарифы" title="Прозрачные планы для роста">
        <div className="grid gap-4 lg:grid-cols-3">
          <PricingCard name="Старт" price="0 ₽" text="Для запуска первой ниши и теста канала продаж." href="/onboarding?plan=start" />
          <PricingCard name="Рост" price="2 900 ₽" text="Для постоянного потока заявок и редактирования витрины." featured href="/onboarding?plan=growth" />
          <PricingCard name="Бизнес" price="7 900 ₽" text="Для команд, нескольких витрин и приоритетной поддержки." href="/onboarding?plan=business" />
        </div>
      </Section>

      <Section eyebrow="Вопросы" title="Частые вопросы">
        <div className="grid gap-3">
          {faq.map((item, index) => (
            <details key={item.q} className="group rounded-2xl border border-line/90 bg-white/95 shadow-soft ring-1 ring-white/50 transition duration-200 ease-premium hover:border-sea/20 open:border-sea/20 open:shadow-premium" open={index === 0}>
              <summary className="cursor-pointer list-none px-5 py-4 text-base font-semibold marker:content-none [&::-webkit-details-marker]:hidden" aria-label={`Вопрос: ${item.q}`}>
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
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink via-[#121826] to-sea p-8 text-white shadow-[0_36px_100px_rgba(10,13,18,0.45),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/10 md:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(29,111,130,0.35),transparent_55%)]" aria-hidden />
          <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-sea/35 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-berry/30 blur-3xl" aria-hidden />
          <h3 className="relative max-w-2xl text-3xl font-extrabold leading-tight tracking-[-0.03em] md:text-5xl md:leading-[1.08]">
            Запустите витрину и примите первый заказ сегодня
          </h3>
          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-6 text-sm font-semibold text-ink shadow-[0_16px_40px_rgba(0,0,0,0.25)] transition duration-200 ease-premium hover:-translate-y-0.5 hover:bg-neutral-100 active:translate-y-0"
            >
              Создать магазин
            </Link>
            <Link
              href="/store/oud-house"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/30 bg-white/5 px-6 text-sm font-semibold backdrop-blur-sm transition duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/15 active:translate-y-0"
            >
              Открыть демо
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
