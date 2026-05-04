"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Gem,
  Gift,
  Heart,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Send,
  ShieldCheck,
  ShoppingBag,
  ShoppingBasket,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  type LucideIcon
} from "lucide-react";
import { createLead, demoStore, money, Product, publicStore, Store } from "@/lib/api";
import { Button, Toast } from "@/components/ui-kit";
import { StoreTheme, themeBySlug } from "@/lib/themes";

type Experience = {
  eyebrow: string;
  headline: string;
  subhead: string;
  categories: string[];
  trust: Array<{ label: string; icon: LucideIcon }>;
  reviews: Array<{ name: string; text: string }>;
  orderNote: string;
  productMood: string;
  lookbookTitle: string;
};

const defaultTrust = [
  { label: "Проверенный продавец", icon: ShieldCheck },
  { label: "Telegram / WhatsApp", icon: MessageCircle },
  { label: "Доставка по региону", icon: Truck },
  { label: "Быстрый checkout", icon: ShoppingCart }
];

export default function PublicStorePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "kavkaz-style";
  const theme = themeBySlug(slug);
  const experience = getExperience(theme);
  const [store, setStore] = useState<Store>({ ...demoStore, slug, theme: theme.code });
  const [products, setProducts] = useState<Product[]>(getThemeProducts(theme));
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState({ name: "", phone: "", city: "", contact: "WhatsApp", comment: "" });
  const [toast, setToast] = useState("");
  const [orderDone, setOrderDone] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await publicStore(slug);
        setStore({ ...data.store, theme: data.store.theme || theme.code });
        setProducts(data.products.length ? data.products : getThemeProducts(theme));
      } catch {
        setStore({
          ...demoStore,
          slug,
          theme: theme.code,
          name: theme.code === "perfume-luxury" ? "Oud House" : theme.code === "halal-market" ? "Halal Basket" : "Amina Wear",
          description: experience.subhead
        });
        setProducts(getThemeProducts(theme));
      }
    }
    load();
  }, [slug, theme, experience.subhead]);

  const cartItems = useMemo(() => products.filter((product) => cart[getKey(product)]), [cart, products]);
  const featuredProduct = products[0];
  const total = cartItems.reduce((sum, product) => sum + product.price * (cart[getKey(product)] || 0), 0);
  const totalCount = cartItems.reduce((sum, product) => sum + (cart[getKey(product)] || 0), 0);
  const isDark = theme.bg === "#111111";
  const themeStyle = {
    "--store-accent": theme.accent,
    "--store-bg": theme.bg,
    "--store-surface": theme.surface,
    "--store-text": theme.text
  } as CSSProperties;
  const whatsapp = `https://wa.me/${(store.contacts?.whatsapp || store.contacts?.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Здравствуйте! Хочу оформить заказ в ${store.name}`)}`;
  const telegram = `https://t.me/${(store.contacts?.telegram || "bazar_demo").replace("@", "")}`;
  const shareUrl = typeof window !== "undefined" ? location.href : `/store/${slug}`;

  function change(product: Product, delta: number) {
    const key = getKey(product);
    setCart((current) => ({ ...current, [key]: Math.max((current[key] || 0) + delta, 0) }));
  }

  function showToast(value: string) {
    setToast(value);
    setTimeout(() => setToast(""), 2400);
  }

  function copyLink() {
    navigator.clipboard?.writeText(shareUrl);
    showToast("Ссылка скопирована");
  }

  async function checkout() {
    await createLead(store.slug, {
      customerName: customer.name || "Гость",
      phone: customer.phone || "+79000000000",
      message: `${customer.comment || "Запрос со storefront"}; items: ${cartItems.map((product) => `${product.title} x${cart[getKey(product)]}`).join(", ")}`
    }).catch(() => null);
    setOrderDone(true);
    setCart({});
    showToast("Заказ принят. Продавец скоро свяжется с вами.");
  }

  return (
    <main className="min-h-screen pb-24 md:pb-0" data-testid="page-store" style={{ ...themeStyle, background: theme.bg, color: theme.text }}>
      {toast && <Toast>{toast}</Toast>}
      <StoreHeader store={store} theme={theme} totalCount={totalCount} onCopy={copyLink} whatsapp={whatsapp} />
      <div
        className="sticky top-[69px] z-20 border-b shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-2xl backdrop-saturate-150"
        style={{ background: isDark ? "rgba(20,20,20,0.82)" : "rgba(255,255,255,0.82)", borderColor: borderColor(isDark) }}
      >
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2.5 text-sm font-bold md:px-6">
          {[
            ["Главная", "#top"],
            ["Каталог", "#catalog"],
            ["Отзывы", "#reviews"],
            ["Заказ", "#checkout"]
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="rounded-xl px-3.5 py-2 ring-1 ring-black/[0.04] transition duration-200 ease-premium hover:-translate-y-px hover:shadow-sm"
              style={{ background: isDark ? "rgba(255,255,255,0.1)" : "rgba(238,242,249,0.95)" }}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>

      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={theme.image} alt={store.name} fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0" style={{ background: heroOverlay(isDark, theme.code) }} />
        </div>
        <div className="relative mx-auto grid min-h-[calc(100svh-74px)] max-w-7xl items-end gap-8 px-4 py-8 md:px-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:py-10">
          <div className="max-w-3xl pb-4 text-white md:pb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full px-4 py-1.5 text-xs font-bold text-ink shadow-md ring-1 ring-white/20" style={{ background: theme.accent }}>{experience.eyebrow}</span>
              <span className="rounded-full border border-white/20 bg-white/12 px-4 py-1.5 text-xs font-bold backdrop-blur-md">{store.city || "Магас"} · заказ сегодня</span>
            </div>
            <h1 className="mt-5 text-5xl font-extrabold leading-[0.94] text-balance tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)] md:text-7xl">{store.name}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/76 md:text-lg">{store.description || experience.subhead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#catalog"
                className="inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-sm font-bold text-ink shadow-[0_16px_40px_rgba(0,0,0,0.2)] ring-1 ring-white/25 transition duration-200 ease-premium hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0"
                style={{ background: theme.accent }}
              >
                Смотреть товары <ArrowRight size={17} />
              </a>
              <a
                href={whatsapp}
                className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/28 bg-white/12 px-6 text-sm font-bold text-white shadow-lg backdrop-blur-md transition duration-200 ease-premium hover:-translate-y-0.5 hover:bg-white/18 active:translate-y-0"
              >
                <MessageCircle size={17} />
                Заказать в WhatsApp
              </a>
            </div>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {experience.trust.slice(0, 3).map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/18 bg-white/12 p-4 shadow-lg backdrop-blur-md ring-1 ring-white/10">
                  <item.icon size={18} style={{ color: theme.accent }} />
                  <p className="mt-2 text-sm font-semibold">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <HeroOrderPreview theme={theme} experience={experience} cartCount={totalCount} total={total} onScrollCheckout={() => document.querySelector("#checkout")?.scrollIntoView({ behavior: "smooth" })} />
        </div>
      </section>

      {featuredProduct && (
        <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div
            className="grid gap-4 overflow-hidden rounded-2xl border p-4 shadow-[0_24px_70px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04] md:p-6 lg:grid-cols-[1fr_1fr]"
            style={{ background: theme.surface, borderColor: borderColor(isDark) }}
          >
            <div className="relative min-h-[260px] overflow-hidden rounded-xl ring-1 ring-black/[0.06]">
              <Image
                src={featuredProduct.images?.[0] || theme.productImage}
                alt={featuredProduct.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <span className="rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-wide" style={{ background: alpha(theme.accent, 0.2) }}>Рекомендуемый товар</span>
                <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">{featuredProduct.title}</h2>
                <p className="mt-3 text-sm leading-6 opacity-75">{featuredProduct.short_description || featuredProduct.description}</p>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="text-2xl font-semibold">{money(featuredProduct.price)}</span>
                <button
                  onClick={() => change(featuredProduct, 1)}
                  className="inline-flex h-11 items-center rounded-2xl px-5 text-sm font-bold text-white shadow-lg transition duration-200 ease-premium hover:brightness-110"
                  style={{ background: theme.accent }}
                >
                  Добавить в заказ
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-5 md:px-6 [content-visibility:auto] [contain-intrinsic-size:1px_280px]">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {experience.categories.map((category, index) => (
            <a
              href="#catalog"
              key={category}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl border px-4 text-sm font-bold shadow-sm transition duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: index === 0 ? theme.accent : theme.surface, color: index === 0 && !isDark ? "#141414" : theme.text, borderColor: borderColor(isDark) }}
            >
              {index === 0 ? <Sparkles size={16} /> : index === 1 ? <Truck size={16} /> : <ChevronDown size={16} />}
              {category}
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 md:px-6 [content-visibility:auto] [contain-intrinsic-size:1px_420px]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {experience.trust.map((item) => (
            <div key={item.label} className="rounded-2xl border p-5 transition duration-200 ease-premium hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]" style={{ background: theme.surface, borderColor: borderColor(isDark) }}>
              <item.icon size={20} style={{ color: theme.accent }} />
              <p className="mt-3 text-sm font-semibold">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 [content-visibility:auto] [contain-intrinsic-size:1px_1400px]" id="catalog">
        <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <span className="rounded-lg px-3 py-1 text-xs font-semibold" style={{ background: alpha(theme.accent, isDark ? 0.24 : 0.14), color: isDark ? theme.accent : theme.text }}>{experience.productMood}</span>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight text-balance tracking-tight md:text-6xl md:leading-[1.05]">{experience.headline}</h2>
          </div>
          <p className="text-sm leading-6 opacity-70">{experience.subhead}</p>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {["Популярное", "Новинки", "Подарки", "С доставкой"].map((label) => (
            <span key={label} className="rounded-full border px-3 py-1.5 text-xs font-bold" style={{ borderColor: borderColor(isDark) }}>{label}</span>
          ))}
        </div>
        <div className={`grid gap-4 ${theme.code === "halal-market" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          {products.map((product, index) => (
            <ProductTile key={getKey(product)} product={product} index={index} theme={theme} cartValue={cart[getKey(product)] || 0} onChange={change} />
          ))}
        </div>
      </section>

      <LookbookSection theme={theme} experience={experience} products={products} />

      <section id="reviews" className="mx-auto max-w-7xl px-4 py-8 md:px-6 [content-visibility:auto] [contain-intrinsic-size:1px_620px]">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <span className="rounded-lg px-3 py-1 text-xs font-semibold" style={{ background: alpha(theme.accent, isDark ? 0.24 : 0.14) }}>Отзывы</span>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-balance tracking-tight md:text-5xl md:leading-[1.08]">Доверие видно до переписки</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 opacity-70">Покупатель видит условия, контакты и быстрый checkout прямо на витрине.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {experience.reviews.map((review) => (
              <article key={review.name} className="rounded-2xl border p-5 shadow-sm transition duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-md" style={{ background: theme.surface, borderColor: borderColor(isDark) }}>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={14} fill={theme.accent} style={{ color: theme.accent }} />)}
                </div>
                <p className="mt-4 text-sm leading-6 opacity-76">{review.text}</p>
                <p className="mt-4 text-sm font-semibold">{review.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="checkout" className="mx-auto max-w-7xl px-4 py-8 md:px-6 [content-visibility:auto] [contain-intrinsic-size:1px_760px]">
        <div className="relative grid gap-5 overflow-hidden rounded-2xl border p-4 shadow-[0_28px_80px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] md:p-7 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]" style={{ background: theme.surface, borderColor: borderColor(isDark) }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 opacity-90" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }} aria-hidden />
          <div className="relative">
            <span className="inline-flex rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-wide" style={{ background: theme.accent, color: theme.code === "perfume-luxury" ? "#111" : "#fff" }}>{experience.orderNote}</span>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl md:leading-[1.08]">Быстрый заказ</h2>
            <p className="mt-3 text-sm leading-6 opacity-70">Контакты, способ связи и товары. Без регистрации и лишних шагов.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={telegram} className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-sea to-cyan-800 px-4 text-sm font-bold text-white shadow-md transition duration-200 ease-premium hover:brightness-110"><Send size={17} />Telegram</a>
              <a href={whatsapp} className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-mint to-emerald-700 px-4 text-sm font-bold text-white shadow-md transition duration-200 ease-premium hover:brightness-110"><MessageCircle size={17} />WhatsApp</a>
              <a href={`tel:${store.contacts?.phone || ""}`} className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-ink to-neutral-800 px-4 text-sm font-bold text-white shadow-md transition duration-200 ease-premium hover:brightness-110"><Phone size={17} />Позвонить</a>
            </div>
          </div>

          {orderDone ? (
            <div className="relative rounded-2xl border p-6 shadow-inner" style={{ background: alpha(theme.accent, 0.1), borderColor: borderColor(isDark) }}>
              <div className="flex items-center gap-2 text-xl font-extrabold"><CheckCircle2 size={22} style={{ color: theme.accent }} />Заказ принят</div>
              <p className="mt-3 text-sm leading-6 opacity-70">Продавец скоро свяжется с вами выбранным способом.</p>
              <Button onClick={() => setOrderDone(false)} className="mt-5" style={{ background: theme.accent } as CSSProperties}>Собрать еще заказ</Button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed p-8 text-center shadow-inner" style={{ borderColor: borderColor(isDark), background: isDark ? "rgba(255,255,255,0.04)" : "#FAFAF7" }}>
              <ShoppingBag className="mx-auto" size={28} style={{ color: theme.accent }} />
              <p className="mt-3 text-lg font-extrabold">Выберите товары из каталога</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 opacity-60">После добавления здесь появится короткая форма заказа.</p>
              <a href="#catalog" className="mt-5 inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-bold text-white shadow-lg transition duration-200 ease-premium hover:brightness-110" style={{ background: theme.accent }}>
                Смотреть каталог <ArrowRight size={17} />
              </a>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-2">
                {cartItems.map((product) => (
                  <div key={getKey(product)} className="flex items-center justify-between gap-3 rounded-xl p-3 text-sm ring-1 ring-black/[0.04]" style={{ background: isDark ? "rgba(255,255,255,0.07)" : "#F7F8F4" }}>
                    <div>
                      <p className="font-semibold">{product.title}</p>
                      <p className="mt-1 text-xs opacity-60">x{cart[getKey(product)]}</p>
                    </div>
                    <p className="font-semibold">{money(product.price * cart[getKey(product)])}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t pt-4 text-xl font-extrabold" style={{ borderColor: borderColor(isDark) }}>
                  <span>Итого</span>
                  <span>{money(total)}</span>
                </div>
              </div>
              <div className="space-y-2">
                {(["name", "phone", "city", "comment"] as const).map((field) => (
                  <input
                    key={field}
                    value={customer[field]}
                    onChange={(event) => setCustomer({ ...customer, [field]: event.target.value })}
                    placeholder={{ name: "Имя", phone: "Телефон", city: "Город", comment: "Комментарий" }[field]}
                    className="h-12 w-full rounded-xl border border-line/90 bg-white px-3 text-sm text-ink outline-none transition duration-200 ease-premium focus:border-sea focus:ring-4 focus:ring-sea/15"
                    style={{ borderColor: borderColor(false) }}
                  />
                ))}
                <select
                  value={customer.contact}
                  onChange={(event) => setCustomer({ ...customer, contact: event.target.value })}
                  className="h-12 w-full rounded-xl border border-line/90 bg-white px-3 text-sm text-ink outline-none transition duration-200 ease-premium focus:border-sea focus:ring-4 focus:ring-sea/15"
                  style={{ borderColor: borderColor(false) }}
                >
                  <option>WhatsApp</option>
                  <option>Telegram</option>
                  <option>Звонок</option>
                </select>
                <Button onClick={checkout} className="w-full" style={{ background: theme.accent } as CSSProperties}>
                  Оформить заказ за 20 секунд
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="relative border-t" style={{ borderColor: borderColor(isDark), background: isDark ? "#0A0A0A" : "#FFFFFF" }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-70" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }} aria-hidden />
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-6 text-sm opacity-80 md:px-6 sm:grid-cols-3">
          <span className="flex items-center gap-2"><Phone size={16} /> {store.contacts?.phone || "+7 900 000-00-00"}</span>
          <span className="flex items-center gap-2"><MessageCircle size={16} /> {store.contacts?.telegram || "@bazar_demo"}</span>
          <span className="flex items-center gap-2"><MapPin size={16} /> {store.city}, {store.region}</span>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-8 md:px-6">
          <Link
            href="/onboarding"
            className="inline-flex h-12 items-center rounded-2xl bg-gradient-to-r from-ink via-ink to-sea px-5 text-sm font-bold text-white shadow-[0_16px_40px_rgba(0,0,0,0.25)] transition duration-200 ease-premium hover:-translate-y-px hover:brightness-110"
          >
            Создать свой магазин
          </Link>
        </div>
      </footer>

      <MobileStickyBar total={total} totalCount={totalCount} theme={theme} whatsapp={whatsapp} />
      <a
        href="#checkout"
        className="fixed bottom-5 right-5 z-40 hidden h-12 items-center rounded-2xl bg-gradient-to-r from-ink to-sea px-5 text-sm font-bold text-white shadow-[0_24px_70px_rgba(10,13,18,0.35)] ring-1 ring-white/15 transition duration-200 ease-premium hover:-translate-y-px hover:brightness-110 md:inline-flex"
      >
        Оставить заявку
      </a>
    </main>
  );
}

function StoreHeader({ store, theme, totalCount, onCopy, whatsapp }: { store: Store; theme: StoreTheme; totalCount: number; onCopy: () => void; whatsapp: string }) {
  const isDark = theme.bg === "#111111";
  return (
    <header className="sticky top-0 z-30 border-b shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-2xl backdrop-saturate-150" style={{ background: isDark ? "rgba(17,17,17,0.88)" : "rgba(255,255,255,0.86)", borderColor: borderColor(isDark), color: theme.text }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: theme.accent }}>{theme.title}</p>
          <h2 className="truncate text-lg font-extrabold tracking-tight md:text-xl">{store.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/onboarding"
            className="hidden h-10 items-center rounded-xl border px-3.5 text-sm font-bold shadow-sm transition duration-200 ease-premium hover:-translate-y-px active:translate-y-0 sm:inline-flex"
            style={{ borderColor: borderColor(isDark), background: theme.surface }}
          >
            Создать магазин
          </Link>
          <button
            type="button"
            onClick={onCopy}
            className="focus-ring hidden h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-bold shadow-sm transition duration-200 ease-premium hover:-translate-y-px active:translate-y-0 sm:inline-flex"
            style={{ borderColor: borderColor(isDark), background: theme.surface }}
          >
            <Copy size={16} />
            Ссылка
          </button>
          <a
            href={whatsapp}
            className="hidden h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white shadow-md transition duration-200 ease-premium hover:-translate-y-px hover:brightness-110 active:translate-y-0 sm:inline-flex"
            style={{ background: theme.accent }}
          >
            <MessageCircle size={16} />
            Написать
          </a>
          <a
            href="#checkout"
            className="relative grid h-11 w-11 place-items-center rounded-xl text-white shadow-lg ring-1 ring-white/20 transition duration-200 ease-premium hover:-translate-y-px hover:brightness-110 active:translate-y-0"
            style={{ background: theme.accent }}
            title="Корзина"
          >
            <ShoppingCart size={18} />
            {totalCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] font-bold text-white shadow-md">{totalCount}</span>}
          </a>
        </div>
      </div>
    </header>
  );
}

function HeroOrderPreview({ theme, experience, cartCount, total, onScrollCheckout }: { theme: StoreTheme; experience: Experience; cartCount: number; total: number; onScrollCheckout: () => void }) {
  return (
    <div className="mb-4 hidden rounded-2xl border border-white/22 bg-white/14 p-5 text-white shadow-[0_28px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/10 backdrop-blur-2xl lg:block">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">Заказ в Telegram</p>
        <span className="rounded-full px-3 py-1 text-[11px] font-bold text-ink shadow-sm" style={{ background: theme.accent }}>в эфире</span>
      </div>
      <div className="mt-4 rounded-xl bg-white p-4 text-ink shadow-xl ring-1 ring-black/[0.06]">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-sea/10 text-sea"><Send size={18} /></span>
          <div>
            <p className="text-sm font-semibold">Новый заказ</p>
            <p className="text-xs text-neutral-500">{experience.orderNote}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <p className="flex items-center justify-between rounded-xl bg-paper p-3"><span>Товары</span><strong>{cartCount || 2}</strong></p>
          <p className="flex items-center justify-between rounded-xl bg-paper p-3"><span>Сумма</span><strong>{total ? money(total) : "7 400 ₽"}</strong></p>
        </div>
        <button onClick={onScrollCheckout} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-lg transition duration-200 ease-premium hover:brightness-110" style={{ background: theme.accent }}>
          Оформить быстро <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function ProductTile({ product, index, theme, cartValue, onChange }: { product: Product; index: number; theme: StoreTheme; cartValue: number; onChange: (product: Product, delta: number) => void }) {
  const isDark = theme.bg === "#111111";
  const isFashion = theme.code === "premium-fashion" || theme.code === "premium-boutique";
  const isHalal = theme.code === "halal-market";
  const featured = isFashion && index === 0;
  const image = product.images?.[0] || (index === 0 ? theme.productImage : theme.image);

  return (
    <article
      className={`group overflow-hidden rounded-2xl border shadow-sm transition duration-200 ease-premium hover:-translate-y-1 hover:border-black/10 hover:shadow-[0_24px_60px_rgba(0,0,0,0.12)] ${featured ? "lg:col-span-2" : ""}`}
      style={{ background: theme.surface, borderColor: borderColor(isDark) }}
    >
      <div className={`relative overflow-hidden ${featured ? "aspect-[16/9]" : isHalal ? "aspect-[5/4]" : "aspect-[4/3]"}`}>
        <Image
          src={image}
          alt={product.title}
          fill
          className="object-cover transition duration-700 ease-premium group-hover:scale-105"
          sizes={featured ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        />
        <div className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-md" style={{ background: theme.accent }}>
          {isHalal ? "доставка" : index === 0 ? "хит" : "new"}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold leading-tight">{product.title}</h3>
            <p className="mt-2 min-h-11 text-sm leading-6 opacity-64">{product.short_description || product.description}</p>
          </div>
          {theme.code === "perfume-luxury" ? <Gem size={18} style={{ color: theme.accent }} /> : isHalal ? <ShoppingBasket size={18} style={{ color: theme.accent }} /> : <Heart size={18} style={{ color: theme.accent }} />}
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-xl font-extrabold">{money(product.price)}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => onChange(product, -1)} className="grid h-10 w-10 place-items-center rounded-xl border transition duration-200 ease-premium hover:bg-black/5" style={{ borderColor: borderColor(isDark) }} title="Убрать">
              <Minus size={15} />
            </button>
            <span className="w-6 text-center text-sm font-bold">{cartValue}</span>
            <button onClick={() => onChange(product, 1)} className="grid h-10 w-10 place-items-center rounded-xl text-white shadow-md transition duration-200 ease-premium hover:-translate-y-0.5 hover:brightness-110" style={{ background: theme.accent }} title="Добавить">
              <Plus size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function LookbookSection({ theme, experience, products }: { theme: StoreTheme; experience: Experience; products: Product[] }) {
  const isDark = theme.bg === "#111111";
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 [content-visibility:auto] [contain-intrinsic-size:1px_560px]">
      <div className="grid gap-4 overflow-hidden rounded-2xl border shadow-[0_20px_60px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04]" style={{ background: theme.surface, borderColor: borderColor(isDark) }}>
        <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="p-5 md:p-8">
            <span className="rounded-lg px-3 py-1 text-xs font-semibold" style={{ background: alpha(theme.accent, isDark ? 0.24 : 0.14) }}>Атмосфера витрины</span>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-balance tracking-tight md:text-5xl md:leading-[1.08]">{experience.lookbookTitle}</h2>
            <p className="mt-4 text-sm leading-6 opacity-70">{theme.hero}</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {theme.copy.map((item) => (
                <div key={item} className="rounded-xl border p-3 text-sm font-bold" style={{ borderColor: borderColor(isDark), background: isDark ? "rgba(255,255,255,0.05)" : "#FAFAF7" }}>
                  <Check size={16} style={{ color: theme.accent }} />
                  <p className="mt-2">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid min-h-[360px] grid-cols-2 gap-2 p-2">
            {[theme.productImage, products[1]?.images?.[0] || theme.image, products[2]?.images?.[0] || theme.productImage].map((image, index) => (
              <div key={`${image}-${index}`} className={`relative overflow-hidden rounded-xl ring-1 ring-black/[0.06] ${index === 0 ? "row-span-2" : ""}`}>
                <Image src={image} alt="" fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileStickyBar({ total, totalCount, theme, whatsapp }: { total: number; totalCount: number; theme: StoreTheme; whatsapp: string }) {
  return (
    <div className="fixed bottom-3 left-1/2 z-40 w-[calc(100%-24px)] max-w-md -translate-x-1/2 rounded-2xl border border-line/80 bg-white/95 p-2 shadow-[0_24px_80px_rgba(10,13,18,0.18)] ring-1 ring-white/70 backdrop-blur-xl md:hidden">
      {totalCount > 0 ? (
        <a href="#checkout" className="flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-lg transition duration-200 ease-premium hover:brightness-110" style={{ background: theme.accent }}>
          <ShoppingCart size={18} />Оформить {money(total)}
        </a>
      ) : (
        <a href={whatsapp} className="flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-lg transition duration-200 ease-premium hover:brightness-110" style={{ background: theme.accent }}>
          <MessageCircle size={18} />Заказать в WhatsApp
        </a>
      )}
    </div>
  );
}

function getExperience(theme: StoreTheme): Experience {
  if (theme.code === "perfume-luxury") {
    return {
      eyebrow: "Премиальный парфюм",
      headline: "Signature scents и подарочные наборы",
      subhead: "Темная premium-витрина с крупными фото, доверием и быстрым заказом аромата в Telegram.",
      categories: ["Коллекция Oud", "Подарки", "Подбор аромата", "Доставка сегодня"],
      trust: [
        { label: "Подарочная упаковка", icon: Gift },
        { label: "Подбор аромата", icon: Gem },
        { label: "Персональный заказ", icon: MessageCircle },
        { label: "Доставка по региону", icon: Truck }
      ],
      reviews: [
        { name: "Амина", text: "Попросила подобрать аромат в подарок, мне сразу прислали варианты в Telegram." },
        { name: "Мадина", text: "Витрина выглядит дорого, фото и упаковка сразу вызывают доверие." },
        { name: "Ислам", text: "Оформил заказ с телефона без регистрации. Продавец ответил через пару минут." }
      ],
      orderNote: "аромат + упаковка",
      productMood: "Премиальный каталог",
      lookbookTitle: "Подача как в boutique-парфюмерии"
    };
  }

  if (theme.code === "halal-market") {
    return {
      eyebrow: "Halal Grocery",
      headline: "Свежие продукты с доставкой сегодня",
      subhead: "Чистая market-витрина: категории, понятные цены, доверие к халяль-продуктам и заказ в WhatsApp.",
      categories: ["Сегодня", "Мясо и птица", "Семейные наборы", "Сладости", "Доставка"],
      trust: [
        { label: "Халяль", icon: ShieldCheck },
        { label: "Свежая поставка", icon: ShoppingBasket },
        { label: "Доставка сегодня", icon: Truck },
        { label: "WhatsApp заказ", icon: MessageCircle }
      ],
      reviews: [
        { name: "Залина", text: "Удобно выбрать семейный набор и сразу отправить заказ в WhatsApp." },
        { name: "Рустам", text: "Цены видно сразу, доставка понятная, не нужно долго переписываться." },
        { name: "Марьяна", text: "Категории на телефоне работают как нормальный продуктовый магазин." }
      ],
      orderNote: "доставка сегодня",
      productMood: "Полка маркет-подбора",
      lookbookTitle: "Понятный grocery layout без лишнего шума"
    };
  }

  return {
    eyebrow: theme.title,
    headline: "Новая коллекция с быстрым заказом",
    subhead: "Editorial-витрина с крупными фото, подбором размера, отзывами и заказом через Telegram.",
    categories: ["Новая коллекция", "Популярное", "Размеры", "Lookbook", "Доставка"],
    trust: defaultTrust,
    reviews: [
      { name: "Амина", text: "Открыла с телефона, выбрала размер и сразу написала продавцу в Telegram." },
      { name: "Мадина", text: "Витрина выглядит как настоящий бренд, не как временная страница." },
      { name: "Лейла", text: "Карточки крупные, фото видно хорошо, заказ занял меньше минуты." }
    ],
    orderNote: "размер + доставка",
    productMood: "Редакционная витрина",
    lookbookTitle: "Лукбук, который продает с первого экрана"
  };
}

function getThemeProducts(theme: StoreTheme): Product[] {
  if (theme.code === "perfume-luxury") {
    return [
      product("demo_oud_1", "Oud Classic 50ml", "Теплый восточный аромат в подарочной упаковке.", 450000, "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80"),
      product("demo_oud_2", "Amber Musk Set", "Набор для подарка с мягким янтарным шлейфом.", 720000, "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=900&q=80"),
      product("demo_oud_3", "Private Scent Box", "Подбор трех ароматов под событие и настроение.", 990000, "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=900&q=80")
    ];
  }

  if (theme.code === "halal-market") {
    return [
      product("demo_halal_1", "Семейный набор", "Мясо, зелень и продукты для ужина с доставкой.", 390000, "https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=900&q=80"),
      product("demo_halal_2", "Фермерские овощи", "Свежий набор на неделю, аккуратная упаковка.", 180000, "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"),
      product("demo_halal_3", "Халяль сладости", "Подарочный набор к чаю для семьи и гостей.", 240000, "https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=900&q=80"),
      product("demo_halal_4", "Доставка сегодня", "Быстрый набор продуктов по вашему списку.", 120000, "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80")
    ];
  }

  return [
    product("demo_fashion_1", "Премиальный платок", "Мягкая посадка, спокойный оттенок, готовый образ.", 290000, "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80"),
    product("demo_fashion_2", "Abaya Soft Black", "Минималистичная abaya для повседневного и вечернего образа.", 680000, "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80"),
    product("demo_fashion_3", "Silk Everyday Set", "Комплект с editorial-подачей и подбором размера.", 540000, "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80")
  ];
}

function product(id: string, title: string, description: string, price: number, image: string): Product {
  return { id, title, slug: id, description, short_description: description, price, currency: "RUB", stock_quantity: 12, images: [image] };
}

function getKey(product: Product) {
  return product.id || product.slug || product.title;
}

function borderColor(isDark: boolean) {
  return isDark ? "rgba(255,255,255,0.14)" : "rgba(20,20,20,0.10)";
}

function alpha(hex: string, opacity: number) {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  const red = (bigint >> 16) & 255;
  const green = (bigint >> 8) & 255;
  const blue = bigint & 255;
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function heroOverlay(isDark: boolean, code: string) {
  if (code === "perfume-luxury") return "linear-gradient(90deg, rgba(0,0,0,0.92), rgba(0,0,0,0.48) 55%, rgba(0,0,0,0.18)), linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.74))";
  if (code === "halal-market") return "linear-gradient(90deg, rgba(15,49,31,0.88), rgba(15,49,31,0.36) 58%, rgba(15,49,31,0.08)), linear-gradient(180deg, rgba(15,49,31,0.12), rgba(15,49,31,0.54))";
  return isDark
    ? "linear-gradient(90deg, rgba(0,0,0,0.82), rgba(0,0,0,0.28)), linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.62))"
    : "linear-gradient(90deg, rgba(13,17,23,0.78), rgba(13,17,23,0.18) 60%, rgba(13,17,23,0.05)), linear-gradient(180deg, rgba(13,17,23,0.04), rgba(13,17,23,0.58))";
}
