"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Bot, Boxes, Copy, ImagePlus, LogOut, Megaphone, MessageCircle, PackageCheck, PhoneCall, Plus, Share2, ShoppingBag, Sparkles, Store as StoreIcon, TrendingUp } from "lucide-react";
import { api, clearSession, demoProducts, demoStore, money, Order, Product, Store } from "@/lib/api";
import { Badge, Button, Card, EmptyState, Skeleton, Toast } from "@/components/ui-kit";
import { AIActions } from "@/components/ai-actions";

export function SellerDashboard() {
  const [store, setStore] = useState<Store>(demoStore);
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [telegram, setTelegram] = useState("not_connected");
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const stores = await api<Store[]>("/api/v1/stores/me");
        const current = stores[0] || demoStore;
        setStore(current);
        setProducts(await api<Product[]>(`/api/v1/stores/${current.id}/products`));
        setOrders(await api<Order[]>(`/api/v1/stores/${current.id}/orders`));
        const status = await api<{ status: string }>(`/api/v1/stores/${current.id}/telegram/status`);
        setTelegram(status.status);
      } catch {
        setOrders([{ id: "BA-DEMO", customer_name: "Амина", customer_phone: "+7 900 111-22-33", status: "new", total_amount: 290000 }]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const todaySales = useMemo(() => orders.reduce((sum, order) => sum + order.total_amount, 0), [orders]);
  const lowStock = products.filter((product) => (product.stock_quantity || 0) <= 5).length;
  const missingPhotos = products.filter((product) => !product.images?.length).length;
  const tips = [
    `${missingPhotos} товара без фото`,
    "Добавьте Telegram — получите заказы быстрее",
    products[0] ? `Сделайте скидку на ${products[0].title}` : "Добавьте первый товар",
    "Сегодня 12 просмотров, но 0 заказов — улучшите оффер",
    "AI может написать пост для вашего товара"
  ];

  async function createAIProduct() {
    const generation = await api<{ output: string }>("/api/v1/ai/generate-product", {
      method: "POST",
      body: JSON.stringify({ user_id: "", store_id: store.id, input: "Премиальный товар для локального магазина" })
    });
    setAiText(generation.output);
    const product = await api<Product>(`/api/v1/stores/${store.id}/products`, {
      method: "POST",
      body: JSON.stringify({
        title: "AI товар",
        description: generation.output,
        short_description: "Создано AI",
        price: 199000,
        currency: "RUB",
        stock_quantity: 10
      })
    });
    setProducts([product, ...products]);
    showToast("AI создал товар и добавил его в каталог");
  }

  async function uploadImage(file: File) {
    const target = products[0];
    if (!target?.id || target.id.startsWith("demo")) {
      showToast("Сначала создайте реальный товар");
      return;
    }
    const body = new FormData();
    body.set("image", file);
    const token = localStorage.getItem("bazar_access_token") || "";
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/products/${target.id}/images`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body
    });
    showToast("Фото добавлено к первому товару");
  }

  async function connectTelegram() {
    const result = await api<{ instruction: string }>(`/api/v1/stores/${store.id}/telegram/connect-code`, { method: "POST", body: "{}" });
    setTelegram(result.instruction);
    showToast("Код подключения Telegram создан");
  }

  function shareStore() {
    const text = `Мой магазин: ${location.origin}/store/${store.slug}`;
    navigator.clipboard?.writeText(text);
    showToast("Ссылка скопирована");
  }

  function showToast(value: string) {
    setToast(value);
    setTimeout(() => setToast(""), 2500);
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-4 text-ink premium-grid">
      {toast && <Toast>{toast}</Toast>}
      <section className="mx-auto max-w-7xl space-y-4">
        <header className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-white"><ShoppingBag size={21} /></div>
            <div>
              <p className="text-sm font-semibold">{store.name}</p>
              <p className="text-xs text-neutral-500">{store.city} · /store/{store.slug}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={createAIProduct}><Sparkles size={17} />Создать товар с AI</Button>
            <Link href="/editor" className="inline-flex h-11 items-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold transition hover:bg-neutral-50"><StoreIcon size={17} />Редактор</Link>
            <button onClick={() => { clearSession(); location.href = "/"; }} className="grid h-11 w-11 place-items-center rounded-md border border-line bg-white" title="Logout"><LogOut size={17} /></button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28" />) : (
            <>
              <Metric icon={<TrendingUp size={18} />} label="Продажи сегодня" value={money(todaySales)} hint="+18% к вчера" />
              <Metric icon={<PackageCheck size={18} />} label="Новые заказы" value={String(orders.filter((order) => order.status === "new").length)} hint="CRM обновлена" />
              <Metric icon={<Boxes size={18} />} label="Товары заканчиваются" value={String(lowStock)} hint="нужно пополнить" />
              <Metric icon={<MessageCircle size={18} />} label="Telegram" value={telegram === "connected" ? "Подключен" : "Нужен код"} hint={telegram === "connected" ? "уведомления активны" : "2 минуты"} />
            </>
          )}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="overflow-hidden">
            <div className="grid lg:grid-cols-[1fr_320px]">
              <div className="p-5 md:p-7">
                <Badge tone="red">AI-рекомендации</Badge>
                <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">Сегодня лучше продвинуть 3 товара и отправить ссылку в Telegram.</h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-600">Bazar AI видит новые заказы, остатки и готовит быстрые действия для владельца магазина.</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button onClick={createAIProduct}><Bot size={17} />Создать товар с AI</Button>
                  <Button variant="secondary" onClick={shareStore}><Share2 size={17} />Поделиться в Telegram/Instagram</Button>
                </div>
                {aiText && <p className="mt-5 rounded-lg border border-line bg-paper p-4 text-sm leading-6">{aiText}</p>}
              </div>
              <div className="bg-ink p-4 text-white">
                <div className="rounded-lg bg-white/[0.08] p-4">
                  <p className="text-xs text-white/55">Публичная ссылка</p>
                  <p className="mt-2 break-all text-lg font-semibold">/store/{store.slug}</p>
                  <Link href={`/store/${store.slug}`} className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-ink">Открыть <ArrowUpRight size={16} /></Link>
                </div>
                <div className="mt-3 rounded-lg bg-white/[0.08] p-4">
                  <p className="text-xs text-white/55">Быстрые действия</p>
                  <div className="mt-3 grid gap-2">
                    <Action icon={<Copy size={16} />} label="Копировать ссылку" onClick={shareStore} />
                    <Action icon={<Megaphone size={16} />} label="Сгенерировать сторис" onClick={() => showToast("AI готовит сторис-картинку товара")} />
                    <label className="flex h-10 items-center gap-2 rounded-md bg-white/10 px-3 text-sm font-semibold">
                      <ImagePlus size={16} />Добавить фото
                      <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => event.target.files?.[0] && uploadImage(event.target.files[0])} />
                    </label>
                    <Action icon={<MessageCircle size={16} />} label="Подключить Telegram" onClick={connectTelegram} />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Новые заказы</h2>
                <p className="text-xs text-neutral-500">CRM для обработки заявок</p>
              </div>
              <Badge tone="green">{orders.length} всего</Badge>
            </div>
            <div className="mt-4 space-y-3">
              {orders.length === 0 ? <EmptyState title="Заказов пока нет" text="Откройте публичную витрину и оформите тестовый заказ." /> : orders.map((order) => (
                <div key={order.id} className="rounded-lg border border-line p-3 transition hover:-translate-y-0.5 hover:shadow-soft">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{order.customer_name}</p>
                    <Badge tone="green">{order.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">{order.customer_phone}</p>
                  <p className="mt-3 text-lg font-semibold">{money(order.total_amount)}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-berry" />
              <h2 className="text-base font-semibold">AI-помощник в интерфейсе</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-neutral-600">Быстрые улучшения текстов, карточек и постов без отдельной страницы.</p>
            <div className="mt-4"><AIActions /></div>
          </Card>
          <Card className="p-4">
            <h2 className="text-base font-semibold">Что сделать дальше</h2>
            <div className="mt-4 space-y-2">
              {tips.map((tip, index) => (
                <button key={tip} className="flex w-full items-center justify-between rounded-md border border-line bg-white p-3 text-left text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-soft">
                  <span>{tip}</span>
                  <Badge tone={index === 0 ? "red" : "blue"}>AI</Badge>
                </button>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Каталог</h2>
                <p className="text-xs text-neutral-500">Mobile-first добавление товара и фото</p>
              </div>
              <Button variant="dark" onClick={createAIProduct}><Plus size={16} />AI товар</Button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {products.map((product) => (
                <article key={product.id || product.title} className="rounded-lg border border-line bg-paper p-3 transition hover:-translate-y-0.5 hover:shadow-soft">
                  <p className="text-sm font-semibold">{product.title}</p>
                  <p className="mt-1 min-h-10 text-xs leading-5 text-neutral-500">{product.short_description || product.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm font-semibold">{money(product.price)}</p>
                    <Badge tone={(product.stock_quantity || 0) <= 5 ? "red" : "neutral"}>{product.stock_quantity || 0} шт</Badge>
                  </div>
                </article>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-base font-semibold">Telegram статус</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">После подключения продавец получает новые заказы, оплату и дневную статистику.</p>
            <Button onClick={connectTelegram} variant="secondary" className="mt-4 w-full"><MessageCircle size={17} />Подключить Telegram</Button>
            <p className="mt-3 break-all rounded-md bg-paper p-3 text-sm">{telegram}</p>
          </Card>
        </section>
      </section>
      <nav className="fixed bottom-3 left-1/2 z-30 flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 justify-between rounded-lg border border-line bg-white/95 p-2 shadow-soft backdrop-blur md:hidden">
        <button className="grid gap-1 rounded-md px-3 py-2 text-xs font-semibold"><StoreIcon size={18} className="mx-auto" />Магазин</button>
        <button className="grid gap-1 rounded-md px-3 py-2 text-xs font-semibold"><Boxes size={18} className="mx-auto" />Товары</button>
        <button className="grid gap-1 rounded-md bg-ink px-3 py-2 text-xs font-semibold text-white"><Sparkles size={18} className="mx-auto" />Продажи</button>
        <button className="grid gap-1 rounded-md px-3 py-2 text-xs font-semibold"><PhoneCall size={18} className="mx-auto" />Клиенты</button>
      </nav>
    </main>
  );
}

function Metric({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
  return (
    <Card className="p-4 transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-paper text-sea">{icon}</span>
        <span className="text-xs font-semibold text-mint">{hint}</span>
      </div>
      <p className="mt-4 text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </Card>
  );
}

function Action({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button onClick={onClick} className="flex h-10 items-center gap-2 rounded-md bg-white/10 px-3 text-sm font-semibold transition hover:bg-white/[0.15]">{icon}{label}</button>;
}
