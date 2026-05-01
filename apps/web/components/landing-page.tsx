import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CheckCircle2,
  ChevronRight,
  Eye,
  Gem,
  MessageCircle,
  PackageCheck,
  Play,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Wand2,
  Zap
} from "lucide-react";
import { Badge, Card, StorePreviewCard } from "@/components/ui-kit";
import { storefrontThemes } from "@/lib/themes";

const proof = ["Первые заказы через Telegram", "Витрина без разработчика", "Mobile-first checkout"];
const steps = [
  { title: "Ответьте на 5 вопросов", text: "Ниша, город, контакты, стиль и канал заказов.", icon: Store },
  { title: "AI соберет витрину", text: "Hero, карточки, тексты, доверие и визуальный пакет.", icon: Wand2 },
  { title: "Отправьте ссылку", text: "Клиент оформляет заказ, продавец получает заявку.", icon: Send }
];
const examples = [storefrontThemes[3], storefrontThemes[0], storefrontThemes[2], storefrontThemes[4]];
const aiJobs = ["Описания товаров", "SEO витрины", "Посты для Telegram", "Редизайн с AI"];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="fixed left-0 right-0 top-0 z-40 px-3 py-3">
        <div className="glass-panel shell flex items-center justify-between rounded-lg px-3 py-3 shadow-soft">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white"><ShoppingBag size={20} /></span>
            <span>
              <span className="block text-sm font-semibold">Bazar AI</span>
              <span className="hidden text-xs text-neutral-500 sm:block">Telegram-first commerce</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-neutral-600 md:flex">
            <a href="#how" className="hover:text-ink">Как работает</a>
            <a href="#stores" className="hover:text-ink">Витрины</a>
            <a href="#pricing" className="hover:text-ink">Тарифы</a>
          </nav>
          <Link href="/onboarding" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800">
            Создать магазин
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <section className="relative min-h-[94svh] overflow-hidden bg-night text-white">
        <Image
          src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1800&q=86"
          alt="Владелец магазина смотрит заказы"
          fill
          priority
          className="object-cover"
        />
        <div className="hero-vignette absolute inset-0" />
        <div className="shell relative grid min-h-[94svh] items-end gap-10 pb-10 pt-28 lg:grid-cols-[1fr_470px] lg:pb-16">
          <div className="max-w-4xl animate-reveal">
            <Badge tone="gold">Telegram orders · AI storefront · mobile checkout</Badge>
            <h1 className="text-balance mt-6 max-w-4xl text-5xl font-semibold leading-[1.02] md:text-7xl">
              Запустите интернет-магазин за 5 минут
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/78 md:text-xl md:leading-8">
              Bazar AI создает красивую витрину, принимает заказы в Telegram и помогает продавать без программиста, дизайнера и сложных настроек.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/onboarding" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-ink shadow-premium transition hover:-translate-y-0.5">
                Создать магазин
                <ArrowRight size={18} />
              </Link>
              <a href="#stores" className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/24 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15">
                <Play size={18} />
                Посмотреть демо
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {proof.map((item) => (
                <span key={item} className="inline-flex items-center gap-2 rounded-md border border-white/16 bg-white/10 px-3 py-2 text-sm font-semibold text-white/86 backdrop-blur">
                  <CheckCircle2 size={16} className="text-saffron" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative animate-reveal lg:pb-2">
            <div className="rounded-lg border border-white/14 bg-white/12 p-3 shadow-premium backdrop-blur">
              <div className="overflow-hidden rounded-lg bg-white text-ink">
                <div className="relative h-48">
                  <Image src={storefrontThemes[3].image} alt="Luxury perfume preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs font-semibold text-saffron">Luxury Perfume</p>
                    <h3 className="mt-1 text-2xl font-semibold">Oud House</h3>
                  </div>
                </div>
                <div className="grid gap-3 p-4">
                  <div className="flex items-center justify-between rounded-md bg-paper p-3">
                    <span className="text-sm font-semibold">Oud Classic 50ml</span>
                    <span className="text-sm font-semibold">4 500 ₽</span>
                  </div>
                  <button className="flex h-11 items-center justify-center gap-2 rounded-md bg-ink text-sm font-semibold text-white">
                    <MessageCircle size={17} />
                    Заказ в Telegram
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 left-4 right-4 rounded-lg border border-line bg-white p-3 text-ink shadow-premium sm:left-auto sm:right-6 sm:w-72">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-mint/10 text-mint"><Bell size={18} /></span>
                <div>
                  <p className="text-sm font-semibold">Новый заказ BA-1042</p>
                  <p className="mt-1 text-xs text-neutral-500">Telegram · Oud Classic · Магас</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="shell py-16">
        <SectionTitle eyebrow="Как это работает" title="Магазин запускается как понятный продуктовый flow" text="Без сложного конструктора: один вопрос на экран, live preview и готовая ссылка для клиента." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((item, index) => (
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

      <section className="bg-white py-16" id="stores">
        <div className="shell">
          <SectionTitle eyebrow="Витрины" title="Storefront выглядит как настоящий магазин, а не шаблон" text="Luxury Perfume, Fashion, Halal Grocery и Bakery получают разную визуальную механику, карточки и checkout." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {examples.map((theme) => (
              <StorePreviewCard key={theme.code} title={theme.title} city={theme.category} image={theme.image} accent={theme.accent} />
            ))}
          </div>
        </div>
      </section>

      <section className="shell grid gap-6 py-16 lg:grid-cols-[1fr_420px]">
        <div>
          <SectionTitle eyebrow="AI, который продает" title="AI подсказывает, как получить больше заказов" text="Он не говорит общими словами, а предлагает конкретные действия: улучшить hero, добавить товар, написать пост или поднять доверие." />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {aiJobs.map((item) => (
              <div key={item} className="rounded-lg border border-line bg-white p-4 shadow-soft">
                <Sparkles size={18} className="text-berry" />
                <p className="mt-4 text-sm font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <Card className="overflow-hidden">
          <div className="bg-ink p-5 text-white">
            <p className="text-xs font-semibold text-saffron">Business cockpit</p>
            <h3 className="mt-4 text-3xl font-semibold">Что сделать дальше?</h3>
          </div>
          <div className="space-y-2 p-4">
            {[
              ["Добавьте 3 товара", PackageCheck],
              ["Подключите Telegram", MessageCircle],
              ["Поделитесь магазином", Send],
              ["Улучшите витрину с AI", Sparkles]
            ].map(([label, Icon]) => (
              <button key={label as string} className="flex w-full items-center justify-between rounded-md border border-line bg-white p-3 text-left text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-soft">
                <span className="flex items-center gap-3"><Icon size={17} className="text-sea" />{label as string}</span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        </Card>
      </section>

      <section className="bg-[#eef5f7] py-16">
        <div className="shell grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionTitle eyebrow="Telegram orders" title="Покупатель оформляет заказ за 20 секунд" text="Большие tap-зоны, sticky CTA на mobile, короткая форма и привычный канал связи." />
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {["Без регистрации", "WhatsApp / Telegram", "Доставка рядом", "Отзывы и доверие"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-line bg-white p-3 text-sm font-semibold shadow-soft">
                  <ShieldCheck size={18} className="text-mint" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-line bg-white p-4 shadow-premium">
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <div className="rounded-lg bg-paper p-4">
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={15} fill="#D99A2B" className="text-saffron" />)}
                </div>
                <p className="mt-5 text-lg font-semibold">“Оформила заказ с телефона, продавец ответил в Telegram через пару минут.”</p>
                <p className="mt-3 text-sm text-neutral-500">Амина, Магас</p>
              </div>
              <div className="rounded-lg bg-ink p-4 text-white">
                <Eye size={19} className="text-saffron" />
                <p className="mt-4 text-3xl font-semibold">1 248</p>
                <p className="mt-1 text-sm text-white/60">просмотров витрины</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="shell py-16">
        <SectionTitle eyebrow="Тарифы" title="Старт без риска, рост без переезда" text="Для alpha-продаж важны скорость, доверие и понятная операционная панель." />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {[
            ["Start", "0 ₽", "Первый магазин, демо-запуск, базовый AI"],
            ["Business", "2 900 ₽", "Товары, заказы, Telegram, визуальные пакеты"],
            ["Growth", "7 900 ₽", "AI-рекомендации, расширенные темы, приоритет"]
          ].map(([name, price, text], index) => (
            <Card key={name} className={`p-5 ${index === 1 ? "border-ink bg-ink text-white" : ""}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{name}</h3>
                {index === 1 && <Badge tone="gold">первым клиентам</Badge>}
              </div>
              <p className="mt-6 text-4xl font-semibold">{price}</p>
              <p className={`mt-3 text-sm leading-6 ${index === 1 ? "text-white/68" : "text-neutral-600"}`}>{text}</p>
              <Link href="/onboarding" className={`mt-6 inline-flex h-11 w-full items-center justify-center rounded-md text-sm font-semibold ${index === 1 ? "bg-white text-ink" : "bg-ink text-white"}`}>
                Запустить
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-4 pb-8 md:px-6">
        <div className="mx-auto max-w-[1184px] overflow-hidden rounded-lg bg-ink p-6 text-white shadow-premium md:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <Badge tone="gold">Готово к показу клиентам</Badge>
              <h2 className="text-balance mt-5 text-4xl font-semibold leading-tight md:text-6xl">Откройте сайт и за 5 секунд покажите ценность.</h2>
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
