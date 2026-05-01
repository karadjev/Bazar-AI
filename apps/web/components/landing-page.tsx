import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CheckCircle2,
  ChevronRight,
  Gem,
  MessageCircle,
  Palette,
  Play,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Wand2,
  Zap
} from "lucide-react";
import { Badge, Card, StorePreviewCard } from "@/components/ui-kit";
import { storefrontThemes } from "@/lib/themes";

const howItWorks = [
  { title: "Выберите нишу", text: "Парфюм, одежда, выпечка, продукты, услуги или бутик.", icon: Store },
  { title: "AI собирает витрину", text: "Структура, тексты, стиль, карточки и первый оффер.", icon: Wand2 },
  { title: "Получайте заказы", text: "Клиенты оформляют покупку, продавец отвечает в Telegram или WhatsApp.", icon: Send }
];

const audiences = ["Парфюм и подарки", "Женская одежда", "Халяль-продукты", "Домашняя выпечка", "Исламские товары", "Салоны красоты"];
const aiFeatures = ["Названия и описания", "SEO для витрины", "Карточки товаров", "Промо-тексты", "Посты для Telegram", "Редизайн магазина"];
const faqs = [
  ["Нужен ли программист?", "Нет. Магазин запускается через wizard, дальше владелец управляет товарами и заказами сам."],
  ["Можно ли продавать через Telegram?", "Да. Bazar AI изначально сделан под Telegram/WhatsApp заказы и быстрый контакт."],
  ["Это только для Кавказа?", "Первый фокус — Кавказ и Россия, но витрины подходят любому локальному бизнесу."],
  ["Можно показать клиентам уже сейчас?", "После редизайна основные экраны выглядят как полноценный SaaS alpha для первых продаж."]
];

export function LandingPage() {
  const examples = [
    storefrontThemes[3],
    storefrontThemes[0],
    storefrontThemes[2],
    storefrontThemes[4],
    storefrontThemes[5],
    storefrontThemes[9],
    storefrontThemes[10]
  ];

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="fixed left-0 right-0 top-0 z-40 px-3 py-3">
        <div className="glass-panel mx-auto flex max-w-7xl items-center justify-between rounded-lg px-3 py-3 shadow-soft">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white"><ShoppingBag size={20} /></span>
            <span>
              <span className="block text-sm font-semibold">Bazar AI</span>
              <span className="hidden text-xs text-neutral-500 sm:block">Telegram-first commerce</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-neutral-600 md:flex">
            <a href="#how" className="hover:text-ink">Как работает</a>
            <a href="#examples" className="hover:text-ink">Примеры</a>
            <a href="#pricing" className="hover:text-ink">Тарифы</a>
          </nav>
          <Link href="/onboarding" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800">
            Создать магазин
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <section className="relative min-h-[92svh] overflow-hidden bg-night text-white">
        <Image
          src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1800&q=85"
          alt="Предприниматель управляет онлайн-магазином"
          fill
          priority
          className="object-cover"
        />
        <div className="hero-vignette absolute inset-0" />
        <div className="relative mx-auto flex min-h-[92svh] max-w-7xl flex-col justify-end px-4 pb-16 pt-32 md:px-6 md:pb-20">
          <div className="max-w-4xl">
            <Badge tone="gold">Shopify + Framer + Stripe + Telegram</Badge>
            <h1 className="text-balance mt-6 max-w-4xl text-5xl font-semibold leading-[1.02] md:text-7xl">
              Создай магазин за 5 минут и получай заказы в Telegram
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/78 md:text-xl md:leading-8">
              Bazar AI помогает бизнесу на Кавказе и в России запускать красивые витрины без программистов, дизайнеров и сложных настроек.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/onboarding" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-ink shadow-premium transition hover:-translate-y-0.5">
                Создать магазин
                <ArrowRight size={18} />
              </Link>
              <a href="#examples" className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/24 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15">
                <Play size={18} />
                Посмотреть демо
              </a>
            </div>
          </div>
          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {[
              ["5 минут", "до публичной витрины"],
              ["Telegram", "заказы без CRM-сложности"],
              ["AI", "тексты, стиль и карточки"]
            ].map(([value, label]) => (
              <div key={value} className="rounded-lg border border-white/14 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-semibold">{value}</p>
                <p className="mt-1 text-sm text-white/62">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionTitle eyebrow="Как это работает" title="Запуск магазина без хаоса в настройках" text="Владелец отвечает на простые вопросы, а Bazar AI собирает витрину, которая сразу похожа на настоящий магазин." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {howItWorks.map((item, index) => (
            <Card key={item.title} className="p-5 transition hover:-translate-y-1 hover:shadow-premium">
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-sea/10 text-sea"><item.icon size={22} /></div>
                <span className="text-sm font-semibold text-neutral-400">0{index + 1}</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{item.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="examples" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionTitle eyebrow="Примеры магазинов" title="Каждая ниша выглядит по-своему" text="Не один шаблон на всех, а визуальные пакеты под товар, доверие, чек и привычный канал покупки." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {examples.map((theme) => (
              <StorePreviewCard key={theme.code} title={theme.title} city={theme.category} image={theme.image} accent={theme.accent} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 md:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionTitle eyebrow="Для кого" title="Для бизнеса, которому нужны продажи, а не бесконечная настройка" text="Bazar AI закрывает первый запуск витрины, быстрый checkout и доверие на мобильном экране." />
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {audiences.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-line bg-white p-3 text-sm font-semibold shadow-soft">
                <CheckCircle2 size={18} className="text-mint" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-ink p-5 text-white shadow-premium">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: "Красивые витрины", icon: Palette },
              { title: "Быстрый checkout", icon: Zap },
              { title: "Заказы в мессенджерах", icon: MessageCircle },
              { title: "Доверие с первого экрана", icon: ShieldCheck }
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                <item.icon size={22} className="text-saffron" />
                <p className="mt-4 text-lg font-semibold">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#EEF5F7] py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 md:px-6 lg:grid-cols-[1fr_420px]">
          <div>
            <SectionTitle eyebrow="AI-возможности" title="AI не развлекает, а помогает продавать" text="Тексты, карточки, офферы и визуальные пакеты собираются вокруг конкретной ниши и канала заказа." />
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {aiFeatures.map((item) => (
                <div key={item} className="rounded-lg border border-line bg-white p-4 shadow-soft">
                  <Sparkles size={18} className="text-berry" />
                  <p className="mt-4 text-sm font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <Card className="h-fit overflow-hidden">
            <div className="bg-ink p-5 text-white">
              <Bot size={24} className="text-saffron" />
              <h3 className="mt-5 text-2xl font-semibold">AI-рекомендация</h3>
              <p className="mt-3 text-sm leading-6 text-white/68">Сегодня лучше вывести подарочный набор в hero, добавить отзыв и отправить ссылку в Telegram-канал.</p>
            </div>
            <div className="space-y-2 p-4">
              {["Обновить hero", "Сделать карточки дороже", "Написать пост"].map((item) => (
                <button key={item} className="flex w-full items-center justify-between rounded-md border border-line bg-white p-3 text-left text-sm font-semibold transition hover:bg-neutral-50">
                  {item}
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 md:px-6 lg:grid-cols-2">
        <div>
          <SectionTitle eyebrow="Telegram / WhatsApp заказы" title="Покупатель оформляет заказ за 20 секунд" text="Мобильная витрина ведет к простому checkout, а продавец получает заявку там, где уже общается с клиентами." />
          <div className="mt-7 flex flex-wrap gap-3">
            {["Без регистрации", "Sticky CTA на mobile", "Контакты рядом", "Доверие и отзывы"].map((item) => (
              <Badge key={item} tone="blue">{item}</Badge>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-line bg-white p-4 shadow-premium">
          <div className="mx-auto max-w-[360px] rounded-[28px] border border-line bg-paper p-3">
            <div className="overflow-hidden rounded-[20px] bg-white">
              <img src={storefrontThemes[3].productImage} alt="Luxury perfume checkout" className="h-48 w-full object-cover" />
              <div className="p-4">
                <p className="text-xs font-semibold text-saffron">Luxury Perfume</p>
                <h3 className="mt-2 text-2xl font-semibold">Oud Classic 50ml</h3>
                <div className="mt-4 rounded-md bg-paper p-3 text-sm">1 товар · 4 500 ₽</div>
                <button className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-ink text-sm font-semibold text-white">
                  <MessageCircle size={18} />
                  Оформить в Telegram
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionTitle eyebrow="Тарифы" title="Начать можно спокойно, расти — без переезда" text="Alpha-пакеты сделаны для первых клиентов и быстрого запуска продаж." />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {[
              ["Start", "0 ₽", "Первый магазин, демо-запуск, базовый AI"],
              ["Business", "2 900 ₽", "Товары, заказы, Telegram, визуальные пакеты"],
              ["Growth", "7 900 ₽", "AI-рекомендации, расширенные темы, приоритет"]
            ].map(([name, price, text], index) => (
              <Card key={name} className={`p-5 ${index === 1 ? "border-ink bg-ink text-white" : ""}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{name}</h3>
                  {index === 1 && <Badge tone="gold">лучший старт</Badge>}
                </div>
                <p className="mt-6 text-4xl font-semibold">{price}</p>
                <p className={`mt-3 text-sm leading-6 ${index === 1 ? "text-white/68" : "text-neutral-600"}`}>{text}</p>
                <Link href="/onboarding" className={`mt-6 inline-flex h-11 w-full items-center justify-center rounded-md text-sm font-semibold ${index === 1 ? "bg-white text-ink" : "bg-ink text-white"}`}>
                  Запустить
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 md:px-6">
        <SectionTitle eyebrow="FAQ" title="Коротко о запуске" text="Вопросы, которые обычно появляются перед первой витриной." />
        <div className="mt-8 space-y-3">
          {faqs.map(([question, answer]) => (
            <details key={question} className="rounded-lg border border-line bg-white p-4 shadow-soft">
              <summary className="cursor-pointer text-base font-semibold">{question}</summary>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-4 pb-8 md:px-6">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-lg bg-ink p-6 text-white shadow-premium md:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <Badge tone="gold">Готово к первым клиентам</Badge>
              <h2 className="text-balance mt-5 text-4xl font-semibold leading-tight md:text-6xl">Запустите витрину, которую не стыдно отправить покупателю.</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/onboarding" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-ink">
                Создать магазин
                <ArrowRight size={18} />
              </Link>
              <Link href="/store/oud-house" className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/18 px-5 text-sm font-semibold text-white">
                Смотреть demo
                <Gem size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-semibold text-sea">
        <BadgeCheck size={17} />
        {eyebrow}
      </div>
      <h2 className="text-balance mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">{title}</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">{text}</p>
    </div>
  );
}
