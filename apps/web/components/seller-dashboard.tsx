"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Copy,
  LogOut,
  Plus,
  Send,
  ShoppingBag,
  TrendingUp
} from "lucide-react";
import { api, authMe, clearSession, dashboardAnalytics, dashboardLeadDetails, dashboardLeads, dashboardStores, deleteProduct, demoProducts, demoStore, getToken, Lead, loginDemo, money, Product, registerDemo, Store, updateDashboardLeadComment, updateDashboardLeadStatus, updateProduct } from "@/lib/api";
import { clearGuestMode } from "@/lib/auth";
import { Badge, Button, Card, EmptyState, Input, MetricCard, Modal, ProductCard, Skeleton, Toast } from "@/components/ui-kit";

type ListResponse<T> = T[] | { data?: T[] };

const nextActions = [
  { title: "Добавьте 3 товара", text: "Каталог с 5+ товарами выглядит живым и вызывает доверие.", icon: "📦", tone: "blue" as const },
  { title: "Подключите Telegram", text: "Новые заказы будут приходить туда, где вы уже общаетесь.", icon: "💬", tone: "green" as const },
  { title: "Поделитесь магазином", text: "Отправьте ссылку в сторис, чат или Telegram-канал.", icon: "🔗", tone: "gold" as const },
  { title: "Улучшите витрину с AI", text: "AI обновит hero, карточки и оффер под вашу нишу.", icon: "✨", tone: "red" as const }
];

export function SellerDashboard() {
  const router = useRouter();
  const [store, setStore] = useState<Store>(demoStore);
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [telegram, setTelegram] = useState("not_connected");
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState<{ stores: number; leads: number; orders: number; gmv: number; period?: number; series?: Array<{ date: string; leads: number; orders: number; gmv: number }> }>({ stores: 0, leads: 0, orders: 0, gmv: 0 });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", price: "" });
  const [saving, setSaving] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authName, setAuthName] = useState("");
  const [leadQuery, setLeadQuery] = useState("");
  const [leadFilter, setLeadFilter] = useState<"all" | "new" | "contacted" | "closed">("all");
  const [leadUpdatingId, setLeadUpdatingId] = useState("");
  const [uploadingProductId, setUploadingProductId] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [createForm, setCreateForm] = useState({ title: "", description: "", price: "" });
  const [productQuery, setProductQuery] = useState("");
  const [productFilter, setProductFilter] = useState<"all" | "active" | "draft">("all");
  const [leadModal, setLeadModal] = useState<Lead | null>(null);
  const [leadComment, setLeadComment] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tipsClosed, setTipsClosed] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState<7 | 30 | 90>(7);
  const overviewRef = useRef<HTMLDivElement | null>(null);
  const leadsRef = useRef<HTMLDivElement | null>(null);
  const productsRef = useRef<HTMLDivElement | null>(null);
  const aiRef = useRef<HTMLDivElement | null>(null);
  const [activePanel, setActivePanel] = useState<"overview" | "leads" | "products" | "ai">("overview");

  async function reloadProducts(storeId: string) {
    if (!storeId || !getToken()) return;
    const productsResponse = await api<ListResponse<Product>>(`/api/v1/stores/${storeId}/products`).catch(() => null);
    const loadedProducts = productsResponse ? (Array.isArray(productsResponse) ? productsResponse : productsResponse.data || []) : [];
    setProducts(loadedProducts.length ? loadedProducts : demoProducts);
  }
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

        if (guestSession) {
          setProducts(demoProducts);
        } else {
          await reloadProducts(current.id);
        }

        const loadedLeads = await dashboardLeads().catch(() => ({ data: [] as Lead[] }));
        setLeads(loadedLeads.data || []);
        const loadedAnalytics = await dashboardAnalytics(analyticsRange).catch(() => ({ data: { stores: 0, leads: 0, orders: 0, gmv: 0, period: analyticsRange, series: [] } }));
        setAnalytics(loadedAnalytics.data || { stores: 0, leads: 0, orders: 0, gmv: 0 });

        const status = guestSession ? { status: "not_connected" } : await api<{ status: string }>(`/api/v1/stores/${current.id}/telegram/status`).catch(() => ({ status: "not_connected" }));
        setTelegram(status.status);
      } catch (err) {
        setLeads([{ id: "LEAD-DEMO", store_id: "demo_store", customer_name: "Амина", phone: "+7 900 111-22-33", status: "new", message: "Хочу оформить заказ" }]);
        setAnalytics({ stores: 1, leads: 1, orders: 0, gmv: 0 });
        setError(normalizeError(err, "Показываем демо-данные. Войдите или создайте магазин, чтобы подключить реальные заказы."));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [analyticsRange]);

  useEffect(() => {
    async function loadUser() {
      if (!getToken()) {
        setAuthName("");
        return;
      }
      try {
        const response = await authMe();
        setAuthName(response.user.name || response.user.email || "Аккаунт подключен");
      } catch {
        clearSession();
        clearGuestMode();
        setAuthName("");
      }
    }
    loadUser();
  }, []);

  const todaySales = useMemo(() => analytics.gmv || leads.length * 290000, [analytics.gmv, leads.length]);
  const storeLink = `/store/${store.slug}`;
  const newOrders = analytics.orders || leads.filter((lead) => lead.status === "new").length || leads.length;
  const views = Math.max(1248, products.length * 217 + (analytics.leads || leads.length) * 83);
  const conversion = views > 0 ? ((newOrders / views) * 100).toFixed(1) : "0.0";
  const visibleProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    return products.filter((product) => {
      const status = (product as Product & { status?: string }).status || "active";
      const statusOk = productFilter === "all" || status === productFilter;
      if (!statusOk) return false;
      if (!q) return true;
      return (product.title || "").toLowerCase().includes(q) || (product.description || "").toLowerCase().includes(q);
    });
  }, [productFilter, productQuery, products]);
  const leadsTimeline = useMemo(() => {
    if (analytics.series?.length) {
      return analytics.series.map((item) => ({
        key: item.date,
        label: new Date(item.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
        leads: Number(item.leads) || 0
      }));
    }
    const days = Array.from({ length: analyticsRange }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (analyticsRange - 1 - i));
      const key = date.toISOString().slice(0, 10);
      return {
        key,
        label: date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
        leads: 0
      };
    });
    const index = new Map(days.map((d, i) => [d.key, i]));
    for (const lead of leads) {
      const key = (lead.created_at || "").slice(0, 10);
      const pos = index.get(key);
      if (pos === undefined) continue;
      days[pos].leads += 1;
    }
    return days;
  }, [analytics.series, analyticsRange, leads]);
  const filteredLeads = useMemo(() => {
    const q = leadQuery.trim().toLowerCase();
    return leads.filter((lead) => {
      const statusOk = leadFilter === "all" || lead.status === leadFilter;
      if (!statusOk) return false;
      if (!q) return true;
      return lead.customer_name.toLowerCase().includes(q) || lead.phone.toLowerCase().includes(q) || lead.message.toLowerCase().includes(q);
    });
  }, [leadFilter, leadQuery, leads]);
  const visibleLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      const priority = (status: string) => {
        if (status === "new") return 0;
        if (status === "contacted") return 1;
        if (status === "closed") return 2;
        return 3;
      };
      const byStatus = priority(a.status) - priority(b.status);
      if (byStatus !== 0) return byStatus;
      const aTime = a.created_at ? Date.parse(a.created_at) : 0;
      const bTime = b.created_at ? Date.parse(b.created_at) : 0;
      return bTime - aTime;
    });
  }, [filteredLeads]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cover = localStorage.getItem("bazar_store_cover_image");
    const savedCreateForm = localStorage.getItem("bazar_dashboard_create_form");
    const tips = localStorage.getItem("bazar_dashboard_tips_closed");
    if (cover) setCoverImage(cover);
    if (savedCreateForm) {
      try {
        setCreateForm(JSON.parse(savedCreateForm));
      } catch {
        // ignore invalid local storage payload
      }
    }
    if (tips === "1") setTipsClosed(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("bazar_dashboard_create_form", JSON.stringify(createForm));
  }, [createForm]);


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
      setProducts((prev) => [product, ...prev]);
      showToast("AI создал товар и добавил его в каталог");
    } catch {
      showToast("Demo: AI подготовил карточку товара");
      setAiText("Добавьте подарочный набор в hero и сделайте карточку с понятной ценой, сроком доставки и кнопкой Telegram.");
    }
  }

  async function uploadImageForProduct(product: Product, file: File) {
    if (!product?.id || product.id.startsWith("demo")) {
      showToast("Сначала создайте реальный товар");
      return;
    }
    setUploadingProductId(product.id);
    try {
      const body = new FormData();
      body.set("image", file);
      const token = localStorage.getItem("bazar_access_token") || "";
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/products/${product.id}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body
      });
      if (!response.ok) {
        throw new Error("Не удалось загрузить фото");
      }
      await reloadProducts(store.id);
      showToast("Фото товара обновлено");
    } catch (err) {
      showToast(normalizeError(err, "Не удалось загрузить фото"));
    } finally {
      setUploadingProductId("");
    }
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
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    showToast("Ссылка на магазин скопирована");
  }

  function showToast(value: string) {
    setToast(value);
    setTimeout(() => setToast(""), 2500);
  }

  function jumpTo(panel: "overview" | "leads" | "products" | "ai") {
    const section = panel === "overview"
      ? overviewRef.current
      : panel === "leads"
        ? leadsRef.current
        : panel === "products"
          ? productsRef.current
          : aiRef.current;
    setActivePanel(panel);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function runAction(title: string) {
    if (title.includes("товара")) {
      jumpTo("products");
      setCreateModalOpen(true);
      return;
    }
    if (title.includes("Telegram")) {
      jumpTo("overview");
      connectTelegram();
      return;
    }
    if (title.includes("Поделитесь")) {
      shareStore();
      return;
    }
    if (title.includes("AI")) {
      jumpTo("ai");
      createAIProduct();
      return;
    }
    showToast("Открываем редактор витрины");
    router.push("/editor");
  }

  function exportLeadsCsv() {
    if (leads.length === 0) {
      showToast("Пока нет заявок для экспорта");
      return;
    }
    const rows = [
      ["Клиент", "Телефон", "Статус", "Комментарий", "Дата"],
      ...leads.map((lead) => [
        lead.customer_name,
        lead.phone,
        leadStatusLabel(lead.status),
        lead.manager_comment || "",
        lead.created_at ? new Date(lead.created_at).toLocaleString("ru-RU") : ""
      ])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${store.slug || "store"}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("CSV с заявками скачан");
  }

  function startEdit(product: Product) {
    if (!product.id || product.id.startsWith("demo")) {
      showToast("Создайте реальный магазин в мастере, чтобы редактировать товары");
      router.push("/onboarding");
      return;
    }
    setEditingProduct(product);
    setEditForm({
      title: product.title || "",
      description: product.short_description || product.description || "",
      price: String(Math.round((product.price || 0) / 100))
    });
  }

  async function saveEdit() {
    if (!editingProduct?.id) return;
    const nextPrice = Number(editForm.price);
    if (!editForm.title.trim() || !Number.isFinite(nextPrice) || nextPrice <= 0) {
      showToast("Проверьте название и цену");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProduct(editingProduct.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || "Описание товара",
        short_description: editForm.description.trim() || "Описание товара",
        price: Math.round(nextPrice * 100),
        currency: editingProduct.currency || "RUB",
        stock_quantity: editingProduct.stock_quantity || 10,
        status: "active",
        image: editingProduct.images?.[0] || editingProduct.image || ""
      });
      setProducts((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      setEditingProduct(null);
      showToast("Товар обновлен");
    } catch (err) {
      showToast(normalizeError(err, "Не удалось обновить товар"));
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(product: Product) {
    if (!product.id || product.id.startsWith("demo")) {
      showToast("Создайте реальный магазин, чтобы удалять товары из каталога");
      router.push("/onboarding");
      return;
    }
    if (!confirm(`Удалить товар "${product.title}"?`)) return;
    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      showToast("Товар удален");
    } catch (err) {
      showToast(normalizeError(err, "Не удалось удалить товар"));
    }
  }

  async function submitAuth() {
    if (!authEmail.trim() || authPassword.trim().length < 8) {
      showToast("Введите email и пароль от 8 символов");
      return;
    }
    setAuthLoading(true);
    try {
      if (authMode === "login") {
        await loginDemo(authEmail.trim(), authPassword.trim());
      } else {
        await registerDemo(authEmail.trim(), authPassword.trim());
      }
      setAuthModalOpen(false);
      showToast("Аккаунт подключен");
      location.reload();
    } catch (err) {
      showToast(normalizeError(err, "Не удалось подключить аккаунт"));
    } finally {
      setAuthLoading(false);
    }
  }

  async function createManualProduct() {
    const title = createForm.title.trim();
    const priceRub = Number(createForm.price);
    if (!store.id || store.id.startsWith("demo")) {
      showToast("Сначала создайте реальный магазин");
      return;
    }
    if (!title || !Number.isFinite(priceRub) || priceRub <= 0) {
      showToast("Укажите название и корректную цену");
      return;
    }
    setCreating(true);
    try {
      const created = await api<Product>(`/api/v1/stores/${store.id}/products`, {
        method: "POST",
        body: JSON.stringify({
          title,
          description: createForm.description.trim() || "Описание товара",
          short_description: createForm.description.trim() || "Описание товара",
          price: Math.round(priceRub * 100),
          currency: "RUB",
          stock_quantity: 10
        })
      });
      if (createImageFile) {
        await uploadImageForProduct(created, createImageFile);
      } else {
        await reloadProducts(store.id);
      }
      setCreateForm({ title: "", description: "", price: "" });
      setCreateImageFile(null);
      setCreateModalOpen(false);
      showToast("Товар добавлен");
    } catch (err) {
      showToast(normalizeError(err, "Не удалось добавить товар"));
    } finally {
      setCreating(false);
    }
  }

  async function changeLeadStatus(lead: Lead, status: "new" | "contacted" | "closed") {
    if (!lead.id || lead.id.startsWith("LEAD-DEMO")) {
      showToast("Подключите реальный магазин в мастере, чтобы менять статусы заявок");
      router.push("/onboarding");
      return;
    }
    setLeadUpdatingId(lead.id);
    try {
      const updated = await updateDashboardLeadStatus(lead.id, status);
      setLeads((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      if (leadModal?.id === lead.id) {
        setLeadModal(updated);
      }
      showToast("Статус заявки обновлен");
    } catch (err) {
      showToast(normalizeError(err, "Не удалось обновить статус заявки"));
    } finally {
      setLeadUpdatingId("");
    }
  }

  function uploadStoreCover(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result || "");
      setCoverImage(data);
      localStorage.setItem("bazar_store_cover_image", data);
      showToast("Обложка витрины обновлена");
    };
    reader.readAsDataURL(file);
  }

  async function changeProductStatus(product: Product, status: "active" | "draft") {
    if (!product.id || product.id.startsWith("demo")) {
      showToast("Создайте реальный магазин, чтобы менять статусы товаров");
      router.push("/onboarding");
      return;
    }
    try {
      const updated = await updateProduct(product.id, {
        title: product.title,
        description: product.description || "Описание товара",
        short_description: product.short_description || product.description || "Описание товара",
        price: product.price,
        currency: product.currency || "RUB",
        stock_quantity: product.stock_quantity || 10,
        status,
        image: product.images?.[0] || product.image || ""
      });
      setProducts((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      showToast("Статус товара обновлен");
    } catch (err) {
      showToast(normalizeError(err, "Не удалось обновить статус товара"));
    }
  }

  async function openLeadDetails(lead: Lead) {
    if (!lead.id || lead.id.startsWith("LEAD-DEMO")) {
      setLeadModal(lead);
      setLeadComment("");
      return;
    }
    try {
      const detailed = await dashboardLeadDetails(lead.id);
      setLeadModal(detailed);
      setLeadComment(detailed.manager_comment || "");
    } catch {
      setLeadModal(lead);
      setLeadComment(lead.manager_comment || "");
    }
  }

  async function saveLeadComment() {
    if (!leadModal) return;
    if (!leadModal.id || leadModal.id.startsWith("LEAD-DEMO")) {
      showToast("Создайте реальный магазин, чтобы сохранять комментарии к заявкам");
      router.push("/onboarding");
      return;
    }
    try {
      const updated = await updateDashboardLeadComment(leadModal.id, leadComment);
      setLeadModal(updated);
      setLeads((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      showToast("Комментарий к заявке сохранен");
    } catch (err) {
      showToast(normalizeError(err, "Не удалось сохранить комментарий"));
    }
  }

  return (
    <main className="min-h-screen bg-paper pb-24 text-ink premium-grid md:pb-6" data-testid="page-dashboard">
      {toast && <Toast>{toast}</Toast>}
      <section className="shell grid gap-4 py-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="relative hidden overflow-hidden rounded-2xl border border-line/90 bg-white/95 p-4 shadow-[0_24px_70px_rgba(10,13,18,0.07)] ring-1 ring-white/60 backdrop-blur-sm transition duration-200 hover:border-sea/15 lg:block">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sea/30 to-transparent" aria-hidden />
          <div className="flex items-center gap-3">
            <div className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-sea via-ink to-berry text-white shadow-[0_12px_28px_rgba(29,111,130,0.3)] ring-1 ring-white/20">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_55%)]" aria-hidden />
              <ShoppingBag size={18} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">BuildYourStore.ai</p>
              <p className="text-sm font-extrabold tracking-tight">Панель продавца</p>
            </div>
          </div>
          <div className="mt-5 grid gap-1.5">
            {[
              { key: "overview", label: "Обзор" },
              { key: "products", label: "Товары" },
              { key: "leads", label: "Заявки" },
              { key: "ai", label: "AI и рост" }
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => jumpTo(item.key as "overview" | "leads" | "products" | "ai")}
                className={`focus-ring h-10 rounded-xl px-3 text-left text-sm font-bold transition duration-200 ${
                  activePanel === item.key
                    ? "bg-gradient-to-r from-ink to-sea text-white shadow-md"
                    : "bg-paper/80 text-neutral-600 hover:bg-white hover:text-ink hover:shadow-sm"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              clearSession();
              clearGuestMode();
              location.href = "/";
            }}
            className="focus-ring mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-line/90 bg-white/90 text-sm font-semibold shadow-sm transition duration-200 hover:border-neutral-300 hover:bg-white"
          >
            <LogOut size={16} /> Выйти
          </button>
        </aside>

        <div className="space-y-4">
          <header className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/60 px-4 py-3 shadow-[0_20px_50px_rgba(10,13,18,0.06)]">
            <div className="flex items-center gap-3">
              <div className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-sea via-ink to-berry text-white shadow-lg ring-1 ring-white/20">
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.28),transparent_55%)]" aria-hidden />
                <ShoppingBag size={21} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-sea">Бизнес-пульт</p>
                <h1 className="text-lg font-extrabold tracking-tight">Добро пожаловать, {store.name}</h1>
                <Link href={storeLink} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-ink">
                  {storeLink}
                  <ArrowUpRight size={13} />
                </Link>
                <p className="mt-1 text-xs text-neutral-500">{authName ? `Аккаунт: ${authName}` : "Гостевой режим: подключите аккаунт для безопасного доступа"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {!authName && <Button variant="secondary" onClick={() => setAuthModalOpen(true)}>Подключить аккаунт</Button>}
              <Button variant="secondary" onClick={shareStore}>Поделиться</Button>
              <Button onClick={createAIProduct}><Plus size={17} />Добавить товар</Button>
            </div>
          </header>

          {error && (
            <div className="rounded-2xl border border-saffron/35 bg-gradient-to-r from-saffron/12 to-saffron/5 p-4 text-sm font-semibold text-neutral-800 shadow-sm ring-1 ring-saffron/15">
              {error}
            </div>
          )}
          {!tipsClosed && (
            <Card className="relative overflow-hidden p-5">
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sea via-berry to-saffron opacity-80" aria-hidden />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">Онбординг-подсказка</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-600">Добавьте 3 товара, загрузите обложку витрины и отправьте ссылку первым клиентам.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setTipsClosed(true); localStorage.setItem("bazar_dashboard_tips_closed", "1"); }}>Скрыть</Button>
              </div>
            </Card>
          )}

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32" />) : (
              <>
                <MetricCard icon={<ShoppingBag size={18} />} label="Заказы сегодня" value={String(newOrders)} hint="из аналитики" />
                <MetricCard icon={<TrendingUp size={18} />} label="Выручка" value={money(todaySales)} hint="+18%" />
                <MetricCard icon={<ShoppingBag size={18} />} label="Товары" value={String(products.length)} hint="в каталоге" />
                <MetricCard icon={<TrendingUp size={18} />} label="Просмотры магазина" value={String(views)} hint="7 дней" />
              </>
            )}
          </section>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Эффективность магазина</h2>
                <p className="text-xs text-neutral-500">Воронка и динамика лидов по дням</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-xl border border-line/90 bg-paper p-1 text-xs font-semibold ring-1 ring-black/[0.02]">
                  {[7, 30, 90].map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setAnalyticsRange(period as 7 | 30 | 90)}
                      className={`focus-ring rounded-lg px-2 py-1 transition duration-200 ease-premium ${analyticsRange === period ? "bg-white shadow-sm" : "text-neutral-500 hover:text-ink"}`}
                    >
                      {period}д
                    </button>
                  ))}
                </div>
                <Badge tone="blue">{conversion}% CR</Badge>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ["Просмотры", views, "bg-slate-300"],
                ["Заявки", analytics.leads || newOrders * 4, "bg-violet-300"],
                ["Заказы", newOrders, "bg-emerald-400"]
              ].map(([label, value, color]) => (
                <div key={label as string} className="rounded-xl border border-line/90 bg-white p-3">
                  <p className="text-xs font-semibold text-neutral-500">{label as string}</p>
                  <p className="mt-1 text-2xl font-semibold">{String(value)}</p>
                  <div className="mt-3 h-2 rounded-full bg-paper">
                    <div className={`h-2 rounded-full ${color as string}`} style={{ width: `${Math.min(Number(value) / Math.max(views, 1), 1) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold text-neutral-500">Лиды по дням</p>
              <div className="mt-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(leadsTimeline.length, 15)}, minmax(0,1fr))` }}>
                {leadsTimeline.slice(-15).map((item) => (
                  <div key={item.key} className="rounded-xl border border-line/90 bg-white p-1 ring-1 ring-black/[0.02]">
                    <div className="h-14 rounded bg-paper p-1">
                      <div className="w-full rounded bg-berry/70" style={{ height: `${Math.max(6, item.leads * 8)}px`, marginTop: "auto" }} />
                    </div>
                    <p className="mt-1 text-[10px] font-semibold text-neutral-500">{item.label}</p>
                  </div>
                ))}
              </div>
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

        <section ref={overviewRef} className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="overflow-hidden">
            <div className="grid lg:grid-cols-[1fr_340px]">
              <div className="p-5 md:p-7">
                <Badge tone="dark">Что сделать дальше?</Badge>
                <h2 className="text-balance mt-5 max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-tight md:text-5xl md:leading-[1.06]">
                  Сейчас важнее всего наполнить витрину и отправить ссылку первым клиентам.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-600">BuildYourStore.ai превращает кабинет в план действий: товары, Telegram, шаринг и улучшение витрины.</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {nextActions.map((action) => (
                    <button key={action.title} type="button" onClick={() => runAction(action.title)} className="focus-ring group relative overflow-hidden rounded-2xl border border-line/90 bg-white/95 p-4 text-left shadow-sm transition duration-200 ease-premium hover:-translate-y-1 hover:border-sea/20 hover:shadow-premium">
                      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sea/25 to-transparent opacity-0 transition group-hover:opacity-100" aria-hidden />
                      <div className="flex items-start gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-sea/12 to-berry/8 text-lg text-sea ring-1 ring-sea/10" aria-hidden>{action.icon}</span>
                        <span>
                          <span className="block text-sm font-semibold">{action.title}</span>
                          <span className="mt-1 block text-xs leading-5 text-neutral-500">{action.text}</span>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative overflow-hidden bg-gradient-to-br from-ink via-[#121826] to-sea p-4 text-white ring-1 ring-white/10">
                <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-sea/25 blur-3xl" aria-hidden />
                <div className="relative rounded-2xl border border-white/12 bg-white/[0.07] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Публичная ссылка</p>
                    <span className="text-sm font-bold text-saffron">BS</span>
                  </div>
                  <p className="mt-3 break-all text-lg font-semibold">{storeLink}</p>
                  <div className="mt-4 grid gap-2">
                    <Link href={storeLink} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-3 text-sm font-semibold text-ink shadow-lg transition duration-200 hover:bg-neutral-100">Открыть магазин <ArrowUpRight size={16} /></Link>
                    <button type="button" onClick={shareStore} className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/18 bg-white/5 px-3 text-sm font-semibold backdrop-blur-sm transition duration-200 hover:bg-white/12"><Copy size={16} />Скопировать</button>
                  </div>
                </div>
                <div className="relative mt-3 rounded-2xl border border-white/12 bg-white/[0.06] p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold">Быстрые действия</p>
                  <div className="mt-3 grid gap-2">
                    <Link href={storeLink} className="flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-semibold transition duration-200 ease-premium hover:bg-white/[0.15]">
                      <ArrowUpRight size={16} />Открыть магазин
                    </Link>
                    <Link href="/onboarding" className="flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-semibold transition duration-200 ease-premium hover:bg-white/[0.15]">
                      <Plus size={16} />Создать магазин
                    </Link>
                    <Action icon="🔗" label="Скопировать ссылку" onClick={shareStore} />
                    <Action icon="✨" label="Улучшить витрину с AI" onClick={createAIProduct} />
                    <label className="flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-semibold transition duration-200 ease-premium hover:bg-white/[0.15]">
                      🖼️ Обложка витрины
                      <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => event.target.files?.[0] && uploadStoreCover(event.target.files[0])} />
                    </label>
                    <label className="flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-semibold transition duration-200 ease-premium hover:bg-white/[0.15]">
                      🖼️ Добавить фото
                      <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => products[0] && event.target.files?.[0] && uploadImageForProduct(products[0], event.target.files[0])} />
                    </label>
                    <Action icon="💬" label="Подключить Telegram" onClick={connectTelegram} />
                    <Action icon="📄" label="Экспорт в CSV" onClick={exportLeadsCsv} />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div ref={leadsRef}>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Заявки клиентов</h2>
                <p className="text-xs text-neutral-500">Список обращений и сумма заказа. Статусы обновляются backend-процессом.</p>
              </div>
              <Badge tone="green">{visibleLeads.length} из {leads.length}</Badge>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
              <Input value={leadQuery} placeholder="Поиск по клиенту, телефону или тексту" onChange={(event) => setLeadQuery(event.target.value)} />
              <div className="inline-flex rounded-xl border border-line/90 bg-paper p-1 text-xs font-semibold ring-1 ring-black/[0.02]">
                {[
                  { key: "all", label: "Все" },
                  { key: "new", label: "Новые" },
                  { key: "contacted", label: "В работе" },
                  { key: "closed", label: "Закрытые" }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setLeadFilter(item.key as "all" | "new" | "contacted" | "closed")}
                    className={`focus-ring rounded-lg px-2.5 py-1 transition duration-200 ease-premium ${leadFilter === item.key ? "bg-white shadow-sm" : "text-neutral-500 hover:text-ink"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {loading ? <Skeleton className="h-44" /> : leads.length === 0 ? (
                <EmptyState
                  title="Поделитесь магазином, чтобы получить первый заказ"
                  text="Скопируйте ссылку и отправьте ее клиентам в Telegram, WhatsApp или Instagram."
                  action={<Button onClick={shareStore} variant="secondary">Поделиться ссылкой</Button>}
                />
              ) : visibleLeads.length === 0 ? (
                <EmptyState
                  title="По этим фильтрам заявок нет"
                  text="Сбросьте поиск или выберите другой статус."
                  action={<Button onClick={() => { setLeadQuery(""); setLeadFilter("all"); }} variant="secondary">Сбросить фильтры</Button>}
                />
              ) : (
                <div className="overflow-hidden rounded-xl border border-line/90 ring-1 ring-black/[0.02]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-paper text-xs font-semibold text-neutral-500">
                      <tr>
                        <th className="px-3 py-2">Клиент</th>
                        <th className="px-3 py-2">Контакт</th>
                        <th className="px-3 py-2">Статус</th>
                        <th className="px-3 py-2 text-right">Сумма</th>
                        <th className="px-3 py-2 text-right">Детали</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleLeads.slice(0, 8).map((lead) => (
                        <tr key={lead.id} className="border-t border-line/90 bg-white">
                          <td className="px-3 py-2 font-semibold">{lead.customer_name}</td>
                          <td className="px-3 py-2 text-xs text-neutral-500">{lead.phone}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Badge tone={leadBadgeTone(lead.status)}>{leadStatusLabel(lead.status)}</Badge>
                              <select
                                value={lead.status}
                                onChange={(event) => changeLeadStatus(lead, event.target.value as "new" | "contacted" | "closed")}
                                disabled={leadUpdatingId === lead.id}
                                className={`h-8 rounded-lg border px-2 text-xs font-semibold transition duration-200 ease-premium disabled:opacity-60 ${leadSelectClass(lead.status)}`}
                              >
                                <option value="new">Новая</option>
                                <option value="contacted">В работе</option>
                                <option value="closed">Закрыта</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right font-semibold">{money(290000)}</td>
                          <td className="px-3 py-2 text-right">
                            <Button variant="ghost" size="sm" onClick={() => openLeadDetails(lead)}>Открыть</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <div ref={aiRef}>
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-berry/10 text-xl text-berry" aria-hidden>✨</span>
              <div>
                <h2 className="text-xl font-semibold">AI подсказывает, как получить больше заказов</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">Следующий лучший шаг: показать 3 товара, добавить доверие и отправить ссылку в Telegram.</p>
              </div>
            </div>
            <div className="mt-5 rounded-lg bg-paper p-4 text-sm leading-6 text-neutral-700">
              {aiText || "Добавьте подарочный набор или популярный товар в hero, включите отзывы и сделайте CTA “Заказать в Telegram” первым действием на мобильном."}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={createAIProduct}>Получить рекомендацию</Button>
              <Button variant="secondary" onClick={shareStore}><Send size={17} />Отправить ссылку</Button>
            </div>
          </Card>
          </div>

          <div ref={productsRef}>
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Товары</h2>
                <p className="mt-1 text-sm text-neutral-500">Добавьте первый товар и начните принимать заявки</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setCreateModalOpen(true)}>Добавить вручную</Button>
                <Button variant="dark" onClick={createAIProduct}><Plus size={16} />AI-товар</Button>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="md:col-span-2 xl:col-span-3 grid gap-2 md:grid-cols-[1fr_auto]">
                <Input value={productQuery} placeholder="Поиск товара по названию или описанию" onChange={(event) => setProductQuery(event.target.value)} />
                <div className="inline-flex rounded-xl border border-line/90 bg-paper p-1 text-xs font-semibold ring-1 ring-black/[0.02]">
                  {[
                    { key: "all", label: "Все" },
                    { key: "active", label: "Активные" },
                    { key: "draft", label: "Черновики" }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setProductFilter(item.key as "all" | "active" | "draft")}
                      className={`focus-ring rounded-lg px-2.5 py-1 transition duration-200 ease-premium ${productFilter === item.key ? "bg-white shadow-sm" : "text-neutral-500 hover:text-ink"}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              {coverImage && (
                <div className="md:col-span-2 xl:col-span-3 overflow-hidden rounded-xl border border-line/90 ring-1 ring-black/[0.02]">
                  <div className="h-36 w-full bg-cover bg-center" style={{ backgroundImage: `url(${coverImage})` }} aria-label="Обложка витрины" role="img" />
                </div>
              )}
              {products.length === 0 ? (
                <div className="md:col-span-3">
                  <EmptyState title="Добавьте первый товар и начните принимать заказы" text="AI подготовит название, описание, цену и карточку для витрины." action={<Button onClick={createAIProduct}>Создать товар с AI</Button>} />
                </div>
              ) : visibleProducts.map((product, index) => (
                <div key={product.id || product.title} className="space-y-2">
                  <ProductCard product={product} image={product.images?.[0] || demoProducts[index]?.images?.[0]} accent="#92385F" />
                  <div className="grid gap-2 sm:grid-cols-4">
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => startEdit(product)}>Редактировать</Button>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => removeProduct(product)}>Удалить</Button>
                    <select
                      value={(product as Product & { status?: string }).status || "active"}
                      onChange={(event) => changeProductStatus(product, event.target.value as "active" | "draft")}
                      className="h-10 rounded-xl border border-line/90 bg-white px-2 text-xs font-semibold transition duration-200 ease-premium"
                    >
                      <option value="active">Активный</option>
                      <option value="draft">Черновик</option>
                    </select>
                    <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line/90 bg-white px-3 text-sm font-semibold transition duration-200 ease-premium hover:bg-paper">
                      {uploadingProductId === product.id ? "Загрузка..." : "Фото"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        disabled={uploadingProductId === product.id}
                        onChange={(event) => product && event.target.files?.[0] && uploadImageForProduct(product, event.target.files[0])}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          </div>
        </section>

          <Card className="p-4 md:hidden">
            <h2 className="text-base font-semibold">Telegram статус</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{telegram === "connected" ? "Уведомления активны" : "Подключите Telegram, чтобы получать заказы быстрее."}</p>
            <Button onClick={connectTelegram} variant="secondary" className="mt-4 w-full">Подключить Telegram</Button>
          </Card>
        </div>
      </section>

      <nav aria-label="Нижняя навигация кабинета" className="fixed bottom-3 left-1/2 z-30 flex w-[calc(100%-24px)] max-w-md -translate-x-1/2 justify-between rounded-2xl border border-line/80 bg-white/92 p-2 shadow-[0_24px_80px_rgba(10,13,18,0.14)] ring-1 ring-white/70 backdrop-blur-xl md:hidden">
        <button type="button" onClick={() => jumpTo("overview")} className={`focus-ring grid gap-0.5 rounded-xl px-2 py-2 text-[11px] font-bold transition ${activePanel === "overview" ? "bg-gradient-to-r from-ink to-sea text-white shadow-md" : "text-neutral-600 hover:bg-paper"}`}><span className="mx-auto">📈</span>Обзор</button>
        <button type="button" onClick={() => jumpTo("products")} className={`focus-ring grid gap-0.5 rounded-xl px-2 py-2 text-[11px] font-bold transition ${activePanel === "products" ? "bg-gradient-to-r from-ink to-sea text-white shadow-md" : "text-neutral-600 hover:bg-paper"}`}><span className="mx-auto">📦</span>Товары</button>
        <button type="button" onClick={() => jumpTo("leads")} className={`focus-ring grid gap-0.5 rounded-xl px-2 py-2 text-[11px] font-bold transition ${activePanel === "leads" ? "bg-gradient-to-r from-ink to-sea text-white shadow-md" : "text-neutral-600 hover:bg-paper"}`}><span className="mx-auto">🧾</span>Заявки</button>
        <button type="button" onClick={() => jumpTo("ai")} className={`focus-ring grid gap-0.5 rounded-xl px-2 py-2 text-[11px] font-bold transition ${activePanel === "ai" ? "bg-gradient-to-r from-ink to-sea text-white shadow-md" : "text-neutral-600 hover:bg-paper"}`}><span className="mx-auto">✨</span>AI</button>
      </nav>

      <Modal title="Редактировать товар" open={Boolean(editingProduct)} onClose={() => !saving && setEditingProduct(null)}>
        <div className="space-y-3">
          <Input value={editForm.title} placeholder="Название товара" onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))} />
          <Input value={editForm.description} placeholder="Краткое описание" onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))} />
          <Input type="number" min={1} value={editForm.price} placeholder="Цена в рублях" onChange={(event) => setEditForm((prev) => ({ ...prev, price: event.target.value }))} />
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setEditingProduct(null)} disabled={saving}>Отмена</Button>
            <Button className="flex-1" onClick={saveEdit} loading={saving}>Сохранить</Button>
          </div>
        </div>
      </Modal>

      <Modal title={authMode === "login" ? "Вход в аккаунт" : "Создание аккаунта"} open={authModalOpen} onClose={() => !authLoading && setAuthModalOpen(false)}>
        <div className="space-y-3">
          <div className="inline-flex rounded-xl border border-line/90 bg-paper p-1 text-sm font-semibold ring-1 ring-black/[0.02]">
            <button type="button" onClick={() => setAuthMode("login")} className={`focus-ring rounded-lg px-3 py-1 transition duration-200 ease-premium ${authMode === "login" ? "bg-white shadow-sm" : "text-neutral-500 hover:text-ink"}`}>Войти</button>
            <button type="button" onClick={() => setAuthMode("register")} className={`focus-ring rounded-lg px-3 py-1 transition duration-200 ease-premium ${authMode === "register" ? "bg-white shadow-sm" : "text-neutral-500 hover:text-ink"}`}>Регистрация</button>
          </div>
          <Input value={authEmail} placeholder="Email" onChange={(event) => setAuthEmail(event.target.value)} />
          <Input type="password" value={authPassword} placeholder="Пароль (минимум 8 символов)" onChange={(event) => setAuthPassword(event.target.value)} />
          <Button className="w-full" onClick={submitAuth} loading={authLoading}>
            {authMode === "login" ? "Войти и синхронизировать" : "Создать и синхронизировать"}
          </Button>
        </div>
      </Modal>

      <Modal title="Детали заявки" open={Boolean(leadModal)} onClose={() => setLeadModal(null)}>
        {leadModal && (
          <div className="space-y-3">
            <div className="rounded-xl border border-line/90 bg-paper p-3 text-sm ring-1 ring-black/[0.02]">
              <p><span className="font-semibold">Клиент:</span> {leadModal.customer_name}</p>
              <p><span className="font-semibold">Контакт:</span> {leadModal.phone}</p>
              <p><span className="font-semibold">Сообщение:</span> {leadModal.message || "—"}</p>
            </div>
            <textarea
              className="h-24 w-full rounded-xl border border-line/90 bg-white p-3 text-sm transition duration-200 ease-premium"
              placeholder="Комментарий менеджера"
              value={leadComment}
              onChange={(event) => setLeadComment(event.target.value)}
            />
            <Button variant="secondary" onClick={saveLeadComment}>Сохранить комментарий</Button>
            <div className="rounded-xl border border-line/90 bg-paper p-3 ring-1 ring-black/[0.02]">
              <p className="text-sm font-semibold">История статусов</p>
              <div className="mt-2 space-y-1 text-xs text-neutral-600">
                {(leadModal.status_history || []).length === 0 ? (
                  <p>Изменений статуса пока нет</p>
                ) : (
                  (leadModal.status_history || []).map((item) => (
                    <p key={`${item.id}-${item.created_at}`}>{new Date(item.created_at).toLocaleString("ru-RU")}: {leadStatusLabel(item.from_status)} {" -> "} {leadStatusLabel(item.to_status)}</p>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal title="Новый товар" open={createModalOpen} onClose={() => !creating && setCreateModalOpen(false)}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {[
              { title: "Подарочный набор", price: "3990", description: "Премиум-комплект для быстрого старта продаж" },
              { title: "Хит недели", price: "2490", description: "Популярный товар с высокой конверсией" },
              { title: "Новый релиз", price: "3190", description: "Новинка для теста спроса и лидогенерации" }
            ].map((preset) => (
              <button
                key={preset.title}
                type="button"
                onClick={() => setCreateForm({ title: preset.title, price: preset.price, description: preset.description })}
                className="rounded-xl border border-line/90 bg-paper px-2.5 py-1 text-xs font-semibold text-neutral-600 transition duration-200 ease-premium hover:bg-white"
              >
                {preset.title}
              </button>
            ))}
          </div>
          <Input value={createForm.title} placeholder="Название товара" onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))} />
          <Input value={createForm.description} placeholder="Описание товара" onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))} />
          <Input type="number" min={1} value={createForm.price} placeholder="Цена в рублях" onChange={(event) => setCreateForm((prev) => ({ ...prev, price: event.target.value }))} />
          <label className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-line/90 bg-white text-sm font-semibold transition duration-200 ease-premium hover:bg-paper">
            {createImageFile ? `Файл: ${createImageFile.name}` : "Загрузить фото товара"}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => setCreateImageFile(event.target.files?.[0] || null)} />
          </label>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setCreateModalOpen(false)} disabled={creating}>Отмена</Button>
            <Button className="flex-1" onClick={createManualProduct} loading={creating}>Создать</Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}

function Action({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="focus-ring flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-semibold transition duration-200 ease-premium hover:bg-white/[0.15]"><span aria-hidden>{icon}</span>{label}</button>;
}

function leadStatusLabel(status: string) {
  if (status === "new") return "Новая";
  if (status === "contacted") return "В работе";
  if (status === "closed") return "Закрыта";
  return status;
}

function leadBadgeTone(status: string): "green" | "blue" | "dark" {
  if (status === "new") return "green";
  if (status === "closed") return "dark";
  return "blue";
}

function normalizeError(error: unknown, fallback: string) {
  if (!(error instanceof Error) || !error.message) return fallback;
  const message = error.message.toLowerCase();
  if (message.includes("validation_error")) return "Проверьте поля формы и повторите";
  if (message.includes("unauthorized") || message.includes("forbidden")) return "Нужен вход в аккаунт для этого действия";
  if (message.includes("not found")) return "Данные не найдены или уже удалены";
  if (message.includes("request failed")) return fallback;
  return error.message;
}

function leadSelectClass(status: string) {
  if (status === "new") return "border-emerald-300 bg-emerald-50 text-emerald-800";
  if (status === "contacted") return "border-sky-300 bg-sky-50 text-sky-800";
  if (status === "closed") return "border-slate-300 bg-slate-100 text-slate-700";
  return "border-line/90 bg-white text-neutral-700";
}
