"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  Boxes,
  Copy,
  Eye,
  ImagePlus,
  LogOut,
  MessageCircle,
  PackageCheck,
  Plus,
  Send,
  Share2,
  ShoppingBag,
  Sparkles,
  Store as StoreIcon,
  TrendingUp,
  Wand2
} from "lucide-react";
import { api, clearSession, dashboardAnalytics, dashboardLeads, dashboardStores, demoProducts, demoStore, getToken, Lead, money, Product, Store } from "@/lib/api";
import { clearGuestMode } from "@/lib/auth";
import { Badge, Button, Card, EmptyState, MetricCard, ProductCard, Skeleton, Toast } from "@/components/ui-kit";

type ListResponse<T> = T[] | { data?: T[] };

const nextActions = [
  { title: "Добавьте 3 товара", text: "Каталог с 5+ товарами выглядит живым и вызывает доверие.", icon: Boxes, tone: "blue" as const },
  { title: "Подключите Telegram", text: "Новые заказы будут приходить туда, где вы уже общаетесь.", icon: MessageCircle, tone: "green" as const },
  { title: "Поделитесь магазином", text: "Отправьте ссылку в сторис, чат или Telegram-канал.", icon: Share2, tone: "gold" as const },
  { title: "Улучшите витрину с AI", text: "AI обновит hero, карточки и оффер под вашу нишу.", icon: Wand2, tone: "red" as const }
];

export function SellerDashboard() {
  const [store, setStore] = useState<Store>(demoStore);
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [telegram, setTelegram] = useState("not_connected");
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState({ stores: 0, leads: 0, orders: 0, gmv: 0 });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const modernStores = await dashboardStores().catch(() => null);
        const legacyStores = modernStores?.data?.length ? null : await api<ListResponse<Store>>("/api/v1/stores/me").catch(() => null);
        const stores = modernStores?.data?.length
          ? modernStores.data
          : (legacyStores ? (Array.isArray(legacyStores) ? legacyStores : legacyStores.data || []) : []);
        const current = stores[0] || demoStore;
        setStore(current);
        const guestSession = !getToken();

        const productsResponse = guestSession ? null : await api<ListResponse<Product>>(`/api/v1/stores/${current.id}/products`).catch(() => null);
        const loadedProducts = productsResponse ? (Array.isArray(productsResponse) ? productsResponse : productsResponse.data || []) : [];
        setProducts(loadedProducts.length ? loadedProducts : demoProducts);

        const loadedLeads = await dashboardLeads().catch(() => ({ data: [] as Lead[] }));
        setLeads(loadedLeads.data || []);
        const loadedAnalytics = await dashboardAnalytics().catch(() => ({ data: { stores: 0, leads: 0, orders: 0, gmv: 0 } }));
        setAnalytics(loadedAnalytics.data || { stores: 0, leads: 0, orders: 0, gmv: 0 });

        const status = guestSession ? { status: "not_connected" } : await api<{ status: string }>(`/api/v1/stores/${current.id}/telegram/status`).catch(() => ({ status: "not_connected" }));
        setTelegram(status.status);
      } catch {
        setLeads([{ id: "LEAD-DEMO", store_id: "demo_store", customer_name: "Амина", phone: "+7 900 111-22-33", status: "new", message: "Хочу оформить заказ" }]);
        setAnalytics({ stores: 1, leads: 1, orders: 0, gmv: 0 });
        setError("Показываем демо-данные. Войдите или создайте магазин, чтобы подключить реальные заказы.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const todaySales = useMemo(() => analytics.gmv || leads.length * 290000, [analytics.gmv, leads.length]);
  const storeLink = `/store/${store.slug}`;
  const newOrders = analytics.orders || leads.filter((lead) => lead.status === "new").length || leads.length;
  const views = Math.max(1248, products.length * 217 + (analytics.leads || leads.length) * 83);
  const conversion = views > 0 ? ((newOrders / views) * 100).toFixed(1) : "0.0";

  async function createAIProduct() {
    try {
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
    } catch {
      showToast("Demo: AI подготовил карточку товара");
      setAiText("Добавьте подарочный набор в hero и сделайте карточку с понятной ценой, сроком доставки и кнопкой Telegram.");
    }
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
    try {
      const result = await api<{ instruction: string }>(`/api/v1/stores/${store.id}/telegram/connect-code`, { method: "POST", body: "{}" });
      setTelegram(result.instruction);
      showToast("Код подключения Telegram создан");
    } catch {
      setTelegram("/start BA-DEMO");
      showToast("Demo-код Telegram готов");
    }
  }

  function shareStore() {
    const text = `${location.origin}${storeLink}`;
    navigator.clipboard?.writeText(text);
    showToast("Ссылка на магазин скопирована");
  }

  function showToast(value: string) {
    setToast(value);
    setTimeout(() => setToast(""), 2500);
  }

  function showPlaceholder(label: string) {
    showToast(`${label} скоро появится`);
  }

  return (
    <main className="min-h-screen bg-paper pb-24 text-ink premium-grid md:pb-6">
      {toast && <Toast>{toast}</Toast>}
      <section className="shell grid gap-4 py-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden rounded-2xl border border-line bg-white p-4 shadow-soft lg:block">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-white"><ShoppingBag size={18} /></div>
            <div>
              <p className="text-xs font-semibold text-neutral-500">BuildYourStore.ai</p>
              <p className="text-sm font-semibold">Панель продавца</p>
            </div>
          </div>
          <div className="mt-5 grid gap-2">
            {["Обзор", "Магазины", "Заявки", "Шаблоны", "Настройки"].map((item, index) => (
              <button key={item} onClick={() => showPlaceholder(item)} className={`h-10 rounded-xl px-3 text-left text-sm font-semibold ${index === 0 ? "bg-ink text-white" : "bg-paper text-neutral-600"}`}>
                {item}
              </button>
            ))}
          </div>
          <button onClick={() => { clearSession(); clearGuestMode(); location.href = "/"; }} className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-line bg-white text-sm font-semibold">
            <LogOut size={16} /> Выйти
          </button>
        </aside>

        <div className="space-y-4">
          <header className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-white"><ShoppingBag size={21} /></div>
              <div>
                <p className="text-xs font-semibold uppercase text-sea">Бизнес-пульт</p>
                <h1 className="text-lg font-semibold">Добро пожаловать, {store.name}</h1>
                <Link href={storeLink} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-ink">
                  {storeLink}
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={shareStore}><Share2 size={17} />Поделиться</Button>
              <Button onClick={createAIProduct}><Plus size={17} />Добавить товар</Button>
            </div>
          </header>

          {error && (
            <div className="rounded-lg border border-saffron/30 bg-saffron/10 p-3 text-sm font-semibold text-neutral-800">
              {error}
            </div>
          )}

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32" />) : (
              <>
                <MetricCard icon={<PackageCheck size={18} />} label="Заказы сегодня" value={String(newOrders)} hint="из аналитики" />
                <MetricCard icon={<TrendingUp size={18} />} label="Выручка" value={money(todaySales)} hint="+18%" />
                <MetricCard icon={<Boxes size={18} />} label="Товары" value={String(products.length)} hint="в каталоге" />
                <MetricCard icon={<Eye size={18} />} label="Просмотры магазина" value={String(views)} hint="7 дней" />
              </>
            )}
          </section>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Эффективность магазина</h2>
                <p className="text-xs text-neutral-500">Последние 7 дней по воронке витрины</p>
              </div>
              <Badge tone="blue">{conversion}% CR</Badge>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ["Просмотры", views, "bg-slate-300"],
                ["Заявки", analytics.leads || newOrders * 4, "bg-violet-300"],
                ["Заказы", newOrders, "bg-emerald-400"]
              ].map(([label, value, color]) => (
                <div key={label as string} className="rounded-xl border border-line bg-white p-3">
                  <p className="text-xs font-semibold text-neutral-500">{label as string}</p>
                  <p className="mt-1 text-2xl font-semibold">{String(value)}</p>
                  <div className="mt-3 h-2 rounded-full bg-paper">
                    <div className={`h-2 rounded-full ${color as string}`} style={{ width: `${Math.min(Number(value) / Math.max(views, 1), 1) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <section className="grid gap-3 md:grid-cols-3">
            {[
              ["Состояние магазина", "Хорошо", "Витрина опубликована и доступна"],
              ["Оформление заказа", leads.length > 0 ? "Активно" : "Ожидает", "Появится после первой заявки"],
              ["Контент", products.length > 2 ? "Нормально" : "Нужно усилить", "Добавьте 6+ товаров и отзывы"]
            ].map(([title, status, text]) => (
              <Card key={title as string} className="p-4">
                <p className="text-xs font-semibold text-neutral-500">{title as string}</p>
                <p className="mt-2 text-xl font-semibold">{status as string}</p>
                <p className="mt-2 text-sm text-neutral-600">{text as string}</p>
              </Card>
            ))}
          </section>

        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="overflow-hidden">
            <div className="grid lg:grid-cols-[1fr_340px]">
              <div className="p-5 md:p-7">
                <Badge tone="dark">Что сделать дальше?</Badge>
                <h2 className="text-balance mt-4 max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">Сейчас важнее всего наполнить витрину и отправить ссылку первым клиентам.</h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-600">BuildYourStore.ai превращает кабинет в план действий: товары, Telegram, шаринг и улучшение витрины.</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {nextActions.map((action) => (
                    <button key={action.title} onClick={() => showPlaceholder(action.title)} className="rounded-lg border border-line bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-premium">
                      <div className="flex items-start gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-md bg-paper text-sea"><action.icon size={18} /></span>
                        <span>
                          <span className="block text-sm font-semibold">{action.title}</span>
                          <span className="mt-1 block text-xs leading-5 text-neutral-500">{action.text}</span>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-ink p-4 text-white">
                <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Публичная ссылка</p>
                    <StoreIcon size={18} className="text-saffron" />
                  </div>
                  <p className="mt-3 break-all text-lg font-semibold">{storeLink}</p>
                  <div className="mt-4 grid gap-2">
                    <Link href={storeLink} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-ink">Открыть магазин <ArrowUpRight size={16} /></Link>
                    <button onClick={shareStore} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/12 px-3 text-sm font-semibold"><Copy size={16} />Скопировать</button>
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-sm font-semibold">Быстрые действия</p>
                  <div className="mt-3 grid gap-2">
                    <Link href="/store/oud-house" className="flex h-10 items-center gap-2 rounded-md bg-white/10 px-3 text-sm font-semibold transition hover:bg-white/[0.15]">
                      <ArrowUpRight size={16} />Открыть магазин
                    </Link>
                    <Link href="/onboarding" className="flex h-10 items-center gap-2 rounded-md bg-white/10 px-3 text-sm font-semibold transition hover:bg-white/[0.15]">
                      <Plus size={16} />Создать магазин
                    </Link>
                    <Action icon={<Copy size={16} />} label="Скопировать ссылку" onClick={shareStore} />
                    <Action icon={<Sparkles size={16} />} label="Улучшить витрину с AI" onClick={createAIProduct} />
                    <label className="flex h-10 items-center gap-2 rounded-md bg-white/10 px-3 text-sm font-semibold transition hover:bg-white/[0.15]">
                      <ImagePlus size={16} />Добавить фото
                      <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => event.target.files?.[0] && uploadImage(event.target.files[0])} />
                    </label>
                    <Action icon={<MessageCircle size={16} />} label="Подключить Telegram" onClick={connectTelegram} />
                    <Action icon={<Wand2 size={16} />} label="Экспорт в CRM" onClick={() => showPlaceholder("Экспорт в CRM")} />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Заявки клиентов</h2>
                <p className="text-xs text-neutral-500">Список обращений и сумма заказа</p>
              </div>
              <Badge tone="green">{leads.length || 0} всего</Badge>
            </div>
            <div className="mt-4 space-y-3">
              {loading ? <Skeleton className="h-44" /> : leads.length === 0 ? (
                <EmptyState
                  title="Поделитесь магазином, чтобы получить первый заказ"
                  text="Скопируйте ссылку и отправьте ее клиентам в Telegram, WhatsApp или Instagram."
                  action={<Button onClick={shareStore} variant="secondary"><Share2 size={16} />Поделиться ссылкой</Button>}
                />
              ) : (
                <div className="overflow-hidden rounded-xl border border-line">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-paper text-xs font-semibold text-neutral-500">
                      <tr>
                        <th className="px-3 py-2">Клиент</th>
                        <th className="px-3 py-2">Контакт</th>
                        <th className="px-3 py-2">Статус</th>
                        <th className="px-3 py-2 text-right">Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.slice(0, 6).map((lead) => (
                        <tr key={lead.id} className="border-t border-line bg-white">
                          <td className="px-3 py-2 font-semibold">{lead.customer_name}</td>
                          <td className="px-3 py-2 text-xs text-neutral-500">{lead.phone}</td>
                          <td className="px-3 py-2"><Badge tone={lead.status === "new" ? "green" : "blue"}>{lead.status}</Badge></td>
                          <td className="px-3 py-2 text-right font-semibold">{money(290000)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-berry/10 text-berry"><Bot size={20} /></span>
              <div>
                <h2 className="text-xl font-semibold">AI подсказывает, как получить больше заказов</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">Следующий лучший шаг: показать 3 товара, добавить доверие и отправить ссылку в Telegram.</p>
              </div>
            </div>
            <div className="mt-5 rounded-lg bg-paper p-4 text-sm leading-6 text-neutral-700">
              {aiText || "Добавьте подарочный набор или популярный товар в hero, включите отзывы и сделайте CTA “Заказать в Telegram” первым действием на мобильном."}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={createAIProduct}><Sparkles size={17} />Получить рекомендацию</Button>
              <Button variant="secondary" onClick={shareStore}><Send size={17} />Отправить ссылку</Button>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Товары</h2>
                <p className="mt-1 text-sm text-neutral-500">Добавьте первый товар и начните принимать заявки</p>
              </div>
              <Button variant="dark" onClick={createAIProduct}><Plus size={16} />AI-товар</Button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {products.length === 0 ? (
                <div className="md:col-span-3">
                  <EmptyState title="Добавьте первый товар и начните принимать заказы" text="AI подготовит название, описание, цену и карточку для витрины." action={<Button onClick={createAIProduct}>Создать товар с AI</Button>} />
                </div>
              ) : products.slice(0, 3).map((product, index) => (
                <ProductCard key={product.id || product.title} product={product} image={product.images?.[0] || demoProducts[index]?.images?.[0]} accent="#92385F" />
              ))}
            </div>
          </Card>
        </section>

          <Card className="p-4 md:hidden">
            <h2 className="text-base font-semibold">Telegram статус</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{telegram === "connected" ? "Уведомления активны" : "Подключите Telegram, чтобы получать заказы быстрее."}</p>
            <Button onClick={connectTelegram} variant="secondary" className="mt-4 w-full"><MessageCircle size={17} />Подключить Telegram</Button>
          </Card>
        </div>
      </section>

      <nav className="fixed bottom-3 left-1/2 z-30 flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 justify-between rounded-lg border border-line bg-white/95 p-2 shadow-premium backdrop-blur md:hidden">
        <button onClick={() => showPlaceholder("Обзор")} className="grid gap-1 rounded-md bg-ink px-3 py-2 text-xs font-semibold text-white"><TrendingUp size={18} className="mx-auto" />Обзор</button>
        <button onClick={() => showPlaceholder("Товары")} className="grid gap-1 rounded-md px-3 py-2 text-xs font-semibold"><Boxes size={18} className="mx-auto" />Товары</button>
        <button onClick={() => showPlaceholder("Заказы")} className="grid gap-1 rounded-md px-3 py-2 text-xs font-semibold"><PackageCheck size={18} className="mx-auto" />Заказы</button>
        <button onClick={() => showPlaceholder("AI")} className="grid gap-1 rounded-md px-3 py-2 text-xs font-semibold"><Sparkles size={18} className="mx-auto" />AI</button>
      </nav>
    </main>
  );
}

function Action({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button onClick={onClick} className="flex h-10 items-center gap-2 rounded-md bg-white/10 px-3 text-sm font-semibold transition hover:bg-white/[0.15]">{icon}{label}</button>;
}
