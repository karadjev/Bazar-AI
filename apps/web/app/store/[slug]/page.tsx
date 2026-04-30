"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Copy, Download, MapPin, MessageCircle, Minus, Phone, Plus, Send, ShoppingCart, Sparkles } from "lucide-react";
import { api, demoProducts, demoStore, money, Product, Store } from "@/lib/api";
import { Badge, Button, Card, EmptyState, Toast } from "@/components/ui-kit";
import { themeBySlug } from "@/lib/themes";

export default function PublicStorePage() {
  const params = useParams<{ slug: string }>();
  const theme = themeBySlug(params.slug);
  const [store, setStore] = useState<Store>(demoStore);
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState({ name: "", phone: "", city: "", contact: "WhatsApp", comment: "" });
  const [toast, setToast] = useState("");
  const [orderDone, setOrderDone] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api<{ store: Store; products: Product[] }>(`/api/v1/public/stores/${params.slug}`);
        setStore(data.store);
        setProducts(data.products.length ? data.products : demoProducts);
      } catch {
        setStore({ ...demoStore, slug: params.slug, theme: theme.code });
      }
    }
    load();
  }, [params.slug, theme.code]);

  const items = useMemo(() => products.filter((product) => cart[product.id || product.title]), [cart, products]);
  const total = items.reduce((sum, product) => sum + product.price * (cart[product.id || product.title] || 0), 0);
  const whatsapp = `https://wa.me/${(store.contacts?.whatsapp || store.contacts?.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent("Здравствуйте! Хочу оформить заказ в " + store.name)}`;

  async function checkout() {
    await api(`/api/v1/public/stores/${store.slug}/orders`, {
      method: "POST",
      body: JSON.stringify({
        customer_name: customer.name || "Гость",
        customer_phone: customer.phone || "+79000000000",
        customer_city: customer.city,
        customer_address: customer.contact,
        comment: customer.comment,
        items: items.map((product) => ({
          product_id: product.id?.startsWith("demo") ? "" : product.id,
          title: product.title,
          quantity: cart[product.id || product.title],
          price: product.price
        }))
      })
    }).catch(() => null);
    setOrderDone(true);
    showToast("Заказ принят. Продавец скоро свяжется с вами.");
    setCart({});
  }

  function change(product: Product, delta: number) {
    const key = product.id || product.title;
    setCart({ ...cart, [key]: Math.max((cart[key] || 0) + delta, 0) });
  }

  function showToast(value: string) {
    setToast(value);
    setTimeout(() => setToast(""), 2600);
  }

  function copyLink() {
    navigator.clipboard?.writeText(location.href);
    showToast("Ссылка скопирована");
  }

  const isDark = theme.bg === "#111111";

  return (
    <main className="min-h-screen" style={{ background: theme.bg, color: theme.text }}>
      {toast && <Toast>{toast}</Toast>}
      <header className="sticky top-0 z-20 border-b backdrop-blur" style={{ borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(20,20,20,0.1)", background: isDark ? "rgba(17,17,17,0.86)" : "rgba(255,255,255,0.86)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase" style={{ color: theme.accent }}>{theme.title}</p>
            <h1 className="text-xl font-semibold">{store.name}</h1>
          </div>
          <a href="#checkout" className="relative grid h-11 w-11 place-items-center rounded-md text-white" style={{ background: theme.accent }} title="Корзина">
            <ShoppingCart size={18} />
            {items.length > 0 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-white">{items.length}</span>}
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-5">
        <div className="relative min-h-[74vh] overflow-hidden rounded-lg">
          <Image src={theme.image} alt={store.name} fill className="object-cover" priority />
          <div className="absolute inset-0" style={{ background: isDark ? "linear-gradient(90deg, rgba(0,0,0,0.82), rgba(0,0,0,0.28))" : "linear-gradient(90deg, rgba(255,255,255,0.92), rgba(255,255,255,0.25))" }} />
          <div className="relative grid min-h-[74vh] items-end p-5 md:p-10 lg:grid-cols-[1fr_360px]">
            <div className="max-w-3xl pb-8">
              <Badge tone={isDark ? "gold" : "blue"}>{store.city} · заказ сегодня</Badge>
              <h2 className="mt-5 text-5xl font-semibold leading-tight md:text-7xl">{store.name}</h2>
              <p className="mt-5 max-w-xl text-base leading-7 opacity-75">{store.description || theme.hero}</p>
              <div className="mt-7 flex flex-wrap gap-2">
                <a href="#catalog" className="inline-flex h-12 items-center gap-2 rounded-md px-5 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: theme.accent }}>Смотреть каталог <ArrowRight size={17} /></a>
                <a href={whatsapp} className="inline-flex h-12 items-center gap-2 rounded-md border px-5 text-sm font-semibold transition hover:bg-white/10" style={{ borderColor: isDark ? "rgba(255,255,255,0.24)" : "rgba(20,20,20,0.14)" }}><MessageCircle size={17} />WhatsApp</a>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={copyLink} className="inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold" style={{ borderColor: isDark ? "rgba(255,255,255,0.24)" : "rgba(20,20,20,0.14)" }}><Copy size={16} />Скопировать ссылку</button>
                <a href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== "undefined" ? location.href : "")}`} className="inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold" style={{ borderColor: isDark ? "rgba(255,255,255,0.24)" : "rgba(20,20,20,0.14)" }}><Send size={16} />Telegram</a>
                <button onClick={() => showToast("AI готовит сторис-картинку товара")} className="inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold" style={{ borderColor: isDark ? "rgba(255,255,255,0.24)" : "rgba(20,20,20,0.14)" }}><Download size={16} />Сторис</button>
              </div>
            </div>
            <div className="mb-8 hidden rounded-lg p-4 shadow-soft lg:block" style={{ background: theme.surface, color: theme.text }}>
              <p className="text-sm font-semibold">Быстрый заказ</p>
              <div className="mt-4 space-y-3 text-sm opacity-75">
                <p className="flex items-center gap-2"><CheckCircle2 size={16} style={{ color: theme.accent }} />Без регистрации</p>
                <p className="flex items-center gap-2"><CheckCircle2 size={16} style={{ color: theme.accent }} />Telegram / WhatsApp</p>
                <p className="flex items-center gap-2"><CheckCircle2 size={16} style={{ color: theme.accent }} />Доставка по региону</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Badge tone="neutral">{theme.mood}</Badge>
            <h2 className="mt-3 text-3xl font-semibold">Каталог</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {["Новинки", "Популярное", "Подарки", "Доставка сегодня"].map((category) => (
              <span key={category} className="shrink-0 rounded-md border px-3 py-2 text-sm font-semibold" style={{ borderColor: isDark ? "rgba(255,255,255,0.16)" : "rgba(20,20,20,0.12)", background: theme.surface }}>{category}</span>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <article key={product.id || product.title} className="overflow-hidden rounded-lg border transition hover:-translate-y-1 hover:shadow-soft" style={{ background: theme.surface, borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(20,20,20,0.1)" }}>
              <div className="relative aspect-[4/3]">
                <Image src={product.images?.[0] || (index === 0 ? theme.productImage : "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80")} alt={product.title} fill className="object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-base font-semibold">{product.title}</p>
                  <Sparkles size={16} style={{ color: theme.accent }} />
                </div>
                <p className="mt-2 min-h-12 text-sm leading-6 opacity-65">{product.short_description || product.description}</p>
                <div className="mt-5 flex items-center justify-between gap-2">
                  <span className="text-lg font-semibold">{money(product.price)}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => change(product, -1)} className="grid h-9 w-9 place-items-center rounded-md border" style={{ borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(20,20,20,0.14)" }} title="Убрать"><Minus size={14} /></button>
                    <span className="w-5 text-center text-sm">{cart[product.id || product.title] || 0}</span>
                    <button onClick={() => change(product, 1)} className="grid h-9 w-9 place-items-center rounded-md text-white" style={{ background: theme.accent }} title="Добавить"><Plus size={14} /></button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="checkout" className="mx-auto max-w-7xl px-4 pb-10">
        <Card className="p-4 md:p-6" style={{ background: theme.surface } as React.CSSProperties}>
          <h2 className="text-2xl font-semibold">Оформление заказа</h2>
          {orderDone ? (
            <div className="mt-5 rounded-lg border border-line bg-mint/10 p-5">
              <div className="flex items-center gap-2 text-lg font-semibold text-mint"><CheckCircle2 size={20} />Заказ принят</div>
              <p className="mt-2 text-sm leading-6 opacity-70">Продавец скоро свяжется с вами выбранным способом.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={whatsapp} className="inline-flex h-10 items-center gap-2 rounded-md bg-mint px-3 text-sm font-semibold text-white"><MessageCircle size={16} />WhatsApp</a>
                <a href={`https://t.me/${(store.contacts?.telegram || "").replace("@", "")}`} className="inline-flex h-10 items-center gap-2 rounded-md bg-sea px-3 text-sm font-semibold text-white"><Send size={16} />Telegram</a>
                <a href={`tel:${store.contacts?.phone || ""}`} className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-white"><Phone size={16} />Позвонить</a>
              </div>
            </div>
          ) : items.length === 0 ? <EmptyState title="Корзина пустая" text="Добавьте товар, чтобы оформить заказ без регистрации." /> : (
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div className="space-y-2">
                {items.map((product) => (
                  <div key={product.id || product.title} className="flex justify-between rounded-md p-3 text-sm" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#FAFAF7" }}>
                    <span>{product.title} x{cart[product.id || product.title]}</span>
                    <span className="font-semibold">{money(product.price * cart[product.id || product.title])}</span>
                  </div>
                ))}
                <p className="pt-3 text-2xl font-semibold">Итого: {money(total)}</p>
              </div>
              <div className="space-y-2">
                {(["name", "phone", "city", "comment"] as const).map((field) => (
                  <input key={field} value={customer[field]} onChange={(event) => setCustomer({ ...customer, [field]: event.target.value })} placeholder={{ name: "Имя", phone: "Телефон", city: "Город", comment: "Комментарий" }[field]} className="h-12 w-full rounded-md border px-3 text-sm text-ink outline-none focus:ring-4" style={{ borderColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(20,20,20,0.12)" }} />
                ))}
                <select value={customer.contact} onChange={(event) => setCustomer({ ...customer, contact: event.target.value })} className="h-12 w-full rounded-md border px-3 text-sm text-ink outline-none focus:ring-4" style={{ borderColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(20,20,20,0.12)" }}>
                  <option>WhatsApp</option>
                  <option>Telegram</option>
                  <option>Звонок</option>
                </select>
                <Button onClick={checkout} className="w-full" style={{ background: theme.accent } as React.CSSProperties}>Оформить заказ</Button>
              </div>
            </div>
          )}
        </Card>
      </section>

      <footer className="border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(20,20,20,0.1)", background: isDark ? "#111" : "#fff" }}>
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-6 text-sm opacity-75 sm:grid-cols-3">
          <span className="flex items-center gap-2"><Phone size={16} /> {store.contacts?.phone || "+7 900 000-00-00"}</span>
          <span className="flex items-center gap-2"><MessageCircle size={16} /> Telegram / WhatsApp</span>
          <span className="flex items-center gap-2"><MapPin size={16} /> {store.city}, {store.region}</span>
        </div>
      </footer>
      {items.length > 0 && (
        <div className="fixed bottom-3 left-1/2 z-30 w-[calc(100%-24px)] max-w-md -translate-x-1/2 rounded-lg border border-line bg-white p-2 shadow-soft md:hidden">
          <a href="#checkout" className="flex h-12 items-center justify-center gap-2 rounded-md text-sm font-semibold text-white" style={{ background: theme.accent }}>
            <ShoppingCart size={18} />Оформить {money(total)}
          </a>
        </div>
      )}
    </main>
  );
}
