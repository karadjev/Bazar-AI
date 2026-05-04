"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  MapPin,
  MessageCircle,
  PackagePlus,
  QrCode,
  Send,
  Share2,
  Sparkles,
  Store as StoreIcon,
  Wand2
} from "lucide-react";
import { clearSession, createStoreOnboarding, getToken, registerDemo, Store } from "@/lib/api";
import { setGuestMode } from "@/lib/auth";
import { Badge, Button, Field, Input, Stepper, Toast } from "@/components/ui-kit";
import { storefrontThemes, themeByNiche } from "@/lib/themes";

type Niche = {
  title: string;
  subtitle: string;
  city: string;
  storeName: string;
  icon: string;
};

const niches: Niche[] = [
  { title: "Женская одежда", subtitle: "коллекции, размеры, подбор образа", city: "Магас", storeName: "Amina Wear", icon: "👗" },
  { title: "Парфюм", subtitle: "подарочные наборы и premium карточки", city: "Грозный", storeName: "Oud House", icon: "🧴" },
  { title: "Халяль-продукты", subtitle: "категории, доставка, быстрый заказ", city: "Назрань", storeName: "Halal Basket", icon: "🛍️" },
  { title: "Торты", subtitle: "события, фото, заявка за минуту", city: "Махачкала", storeName: "Cake Atelier", icon: "🎂" },
  { title: "Исламские товары", subtitle: "книги, подарки, спокойная подача", city: "Дербент", storeName: "Iman Store", icon: "📚" },
  { title: "Локальный бренд", subtitle: "доверие, история, заказы в Telegram", city: "Владикавказ", storeName: "Kavkaz Studio", icon: "🏪" }
];

const steps = ["Ниша", "Город", "Контакты", "Стиль", "Генерация", "Готово"];
const generationTasks = ["Название и оффер", "Визуальный стиль", "Карточки товаров", "Telegram checkout", "Публичная ссылка"];
const visualPacks = storefrontThemes.filter((theme) => ["premium-fashion", "perfume-luxury", "halal-market", "cakes-food", "islamic-store", "beauty-salon", "premium-boutique"].includes(theme.code));

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generationIndex, setGenerationIndex] = useState(0);
  const [store, setStore] = useState<Store | null>(null);
  const [toast, setToast] = useState("");
  const [launchPlan, setLaunchPlan] = useState("");
  const [form, setForm] = useState({
    email: "demo@bazar.ai",
    password: "demo-password",
    niche: "Женская одежда",
    name: "Amina Wear",
    region: "Ингушетия",
    city: "Магас",
    phone: "+79000000000",
    whatsapp: "+79000000000",
    telegram: "@bazar_demo",
    style: "premium-fashion"
  });

  const selectedTheme = useMemo(() => storefrontThemes.find((theme) => theme.code === form.style) || themeByNiche(form.niche), [form.style, form.niche]);
  const storeSlug = store?.slug || form.name.toLowerCase().replaceAll(" ", "-");
  const storePath = `/store/${storeSlug}`;
  const publicUrl = typeof window !== "undefined" ? `${location.origin}${storePath}` : storePath;
  const shareText = encodeURIComponent(`Мой магазин ${form.name}: ${publicUrl}`);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const presetNiche = params.get("niche");
    const presetStyle = params.get("style");
    const presetName = params.get("name");
    const presetCity = params.get("city");
    const plan = params.get("plan");
    if (plan === "start") setLaunchPlan("Тариф: Старт");
    else if (plan === "growth") setLaunchPlan("Тариф: Рост");
    else if (plan === "business") setLaunchPlan("Тариф: Бизнес");
    else setLaunchPlan("");
    if (!presetNiche && !presetStyle && !presetName && !presetCity) return;
    setForm((prev) => ({
      ...prev,
      niche: presetNiche || prev.niche,
      style: presetStyle || prev.style,
      name: presetName || prev.name,
      city: presetCity || prev.city
    }));
  }, []);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => setGenerationIndex((value) => Math.min(value + 1, generationTasks.length - 1)), 620);
    return () => clearInterval(interval);
  }, [loading]);

  async function finish() {
    setLoading(true);
    setGenerationIndex(0);
    await new Promise((resolve) => setTimeout(resolve, 2300));
    try {
      if (!getToken() && form.email.trim() && form.password.trim().length >= 8) {
        await registerDemo(form.email.trim(), form.password.trim()).catch(() => null);
      }
      const input = {
        niche: form.niche,
        name: form.name,
        region: form.region,
        city: form.city,
        style: form.style,
        contacts: { phone: form.phone, whatsapp: form.whatsapp, telegram: form.telegram }
      };
      let result: { store: Store; guest_mode?: boolean };
      try {
        result = await createStoreOnboarding(input);
      } catch {
        clearSession();
        result = await createStoreOnboarding(input);
      }
      setStore(result.store);
      setGuestMode(Boolean(result.guest_mode));
    } catch {
      setGuestMode(true);
      setStore({
        id: "demo_store",
        name: form.name,
        slug: storeSlug,
        description: `${selectedTheme.tagline}. Заказы через Telegram и WhatsApp.`,
        region: form.region,
        city: form.city,
        theme: form.style,
        contacts: { phone: form.phone, whatsapp: form.whatsapp, telegram: form.telegram }
      });
    } finally {
      setLoading(false);
      setStep(5);
    }
  }

  function showToast(value: string) {
    setToast(value);
    setTimeout(() => setToast(""), 2200);
  }

  function copyLink() {
    navigator.clipboard?.writeText(publicUrl);
    showToast("Ссылка скопирована");
  }

  function canGoNext(currentStep: number) {
    if (currentStep === 0) return Boolean(form.niche.trim());
    if (currentStep === 1) return form.name.trim().length >= 2 && form.region.trim().length >= 2 && form.city.trim().length >= 2 && form.email.includes("@") && form.password.trim().length >= 8;
    if (currentStep === 2) return Boolean(form.phone.trim() || form.whatsapp.trim() || form.telegram.trim());
    if (currentStep === 3) return Boolean(form.style.trim());
    return true;
  }

  return (
    <main className="min-h-screen bg-paper text-ink premium-grid" data-testid="page-onboarding">
      {toast && <Toast>{toast}</Toast>}
      <header className="sticky top-0 z-30 border-b border-line/60 bg-white/75 shadow-[0_12px_40px_rgba(10,13,18,0.04)] backdrop-blur-2xl backdrop-saturate-150">
        <div className="shell flex items-center justify-between gap-3 py-3">
          <Link href="/" className="group flex min-w-0 items-center gap-3 rounded-2xl outline-none ring-ink/0 transition duration-200 ease-premium hover:ring-2 hover:ring-sea/15 focus-visible:ring-2 focus-visible:ring-sea/40">
            <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-sea via-ink to-berry text-white shadow-[0_12px_28px_rgba(29,111,130,0.35)] ring-1 ring-white/25">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" aria-hidden />
              <StoreIcon size={20} />
            </span>
            <span className="min-w-0">
              <span className="block truncate bg-gradient-to-r from-ink to-neutral-600 bg-clip-text text-sm font-bold text-transparent">BuildYourStore.ai</span>
              <span className="block truncate text-xs font-semibold text-neutral-500">Запуск магазина{launchPlan ? ` · ${launchPlan}` : ""}</span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/templates"
              className="hidden h-10 items-center rounded-2xl border border-line/90 bg-white/95 px-3.5 text-sm font-semibold shadow-sm transition duration-200 ease-premium hover:-translate-y-px hover:border-neutral-300 hover:bg-white sm:inline-flex"
            >
              Шаблоны
            </Link>
            <Link
              href="/dashboard"
              className="hidden h-10 items-center rounded-2xl border border-line/90 bg-white/95 px-3.5 text-sm font-semibold shadow-sm transition duration-200 ease-premium hover:-translate-y-px hover:border-neutral-300 hover:bg-white sm:inline-flex"
            >
              Кабинет
            </Link>
            <a
              href={storePath}
              className="inline-flex h-10 items-center gap-2 rounded-2xl bg-gradient-to-r from-ink via-ink to-sea px-4 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(10,13,18,0.22)] transition duration-200 ease-premium hover:-translate-y-px hover:brightness-110 active:translate-y-0"
            >
              Предпросмотр <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </header>

      <section className="shell py-5 md:py-8">
        <div className="mb-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
          <div className="relative">
            <div className="pointer-events-none absolute -left-16 top-0 hidden h-48 w-48 rounded-full bg-sea/12 blur-3xl md:block" aria-hidden />
            <Badge tone="gold">Премиум-мастер</Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.08] text-balance tracking-tight md:text-6xl md:leading-[1.05]">
              Соберите витрину, которую{" "}
              <span className="bg-gradient-to-r from-sea via-berry to-saffron bg-clip-text text-transparent">не стыдно показать</span> первому клиенту
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 md:text-base md:leading-8">
              Мы ведем вас пошагово: от ниши до готовой ссылки. Каждый шаг сразу отражается в живом предпросмотре.
            </p>
          </div>
          <div className="rounded-2xl border border-line/90 bg-white/95 p-5 shadow-[0_20px_60px_rgba(10,13,18,0.08)] ring-1 ring-white/70 backdrop-blur-sm">
            <Stepper steps={steps} active={step} />
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_390px]">
          <aside className="hidden xl:block">
            <div className="relative sticky top-24 overflow-hidden rounded-2xl border border-line/90 bg-white/95 p-4 shadow-[0_24px_70px_rgba(10,13,18,0.07)] ring-1 ring-white/60 backdrop-blur-sm">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sea/30 to-transparent" aria-hidden />
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-500">Прогресс запуска</p>
              <div className="mt-4 space-y-2">
                {steps.map((item, index) => (
                  <div
                    key={item}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition duration-200 ease-premium ${
                      index === step
                        ? "border-sea/30 bg-gradient-to-r from-ink to-sea text-white shadow-md"
                        : index < step
                          ? "border-mint/25 bg-mint/[0.09] text-neutral-800"
                          : "border-line/80 bg-paper/80 text-neutral-500"
                    }`}
                  >
                    {index + 1}. {item}
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-line/80 bg-gradient-to-b from-paper to-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Текущий магазин</p>
                <p className="mt-2 text-sm font-extrabold">{form.name}</p>
                <p className="mt-1 text-xs font-medium text-neutral-500">
                  {form.city}, {form.region}
                </p>
              </div>
            </div>
          </aside>

          <section className="relative overflow-hidden rounded-2xl border border-line/90 bg-white/98 p-4 shadow-[0_28px_90px_rgba(10,13,18,0.09)] ring-1 ring-white/70 backdrop-blur-sm md:p-8">
            <div className="pointer-events-none absolute -right-20 top-0 h-40 w-40 rounded-full bg-berry/8 blur-3xl" aria-hidden />
            {step === 0 && (
              <WizardPanel eyebrow="Шаг 1" title="Что вы продаете?">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {niches.map((niche) => (
                    <ChoiceCard
                      key={niche.title}
                      active={form.niche === niche.title}
                      icon={niche.icon}
                      title={niche.title}
                      subtitle={niche.subtitle}
                      onClick={() => {
                        const theme = themeByNiche(niche.title);
                        setForm({ ...form, niche: niche.title, city: niche.city, name: niche.storeName, style: theme.code });
                      }}
                    />
                  ))}
                </div>
              </WizardPanel>
            )}

            {step === 1 && (
              <WizardPanel eyebrow="Шаг 2" title="В каком городе магазин?">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="md:col-span-3">
                    <Field label="Название магазина" value={form.name} onChange={(name) => setForm({ ...form, name })} />
                  </div>
                  <Field label="Регион" value={form.region} onChange={(region) => setForm({ ...form, region })} />
                  <Field label="Город" value={form.city} onChange={(city) => setForm({ ...form, city })} />
                  <div className="rounded-xl border border-line/90 bg-paper/90 p-4 ring-1 ring-black/[0.02]">
                    <MapPin size={18} className="text-sea" />
                    <p className="mt-3 text-sm font-semibold">{form.city || "Город"}</p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">Эта география попадет в доставку, доверие и CTA.</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-line/90 bg-paper/90 p-4 ring-1 ring-black/[0.02]">
                  <p className="text-xs font-semibold uppercase text-neutral-500">Аккаунт владельца</p>
                  <p className="mt-2 text-sm text-neutral-600">Чтобы сохранить доступ к магазину, укажите email и пароль (минимум 8 символов).</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <Field label="Email" value={form.email} onChange={(email) => setForm({ ...form, email })} placeholder="owner@store.ru" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Пароль</p>
                      <Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Минимум 8 символов" />
                    </div>
                  </div>
                </div>
              </WizardPanel>
            )}

            {step === 2 && (
              <WizardPanel eyebrow="Шаг 3" title="Куда отправлять заказы?">
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Телефон" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
                  <Field label="WhatsApp" value={form.whatsapp} onChange={(whatsapp) => setForm({ ...form, whatsapp })} />
                  <Field label="Telegram" value={form.telegram} onChange={(telegram) => setForm({ ...form, telegram })} />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {["Заказ в Telegram", "Оформление в WhatsApp", "Звонок клиенту"].map((item, index) => (
                    <div key={item} className="rounded-xl border border-line/90 bg-paper/90 p-4 ring-1 ring-black/[0.02]">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-sea shadow-sm ring-1 ring-black/[0.04]">{index === 0 ? <Send size={17} /> : index === 1 ? <MessageCircle size={17} /> : <CheckCircle2 size={17} />}</span>
                      <p className="mt-3 text-sm font-semibold">{item}</p>
                    </div>
                  ))}
                </div>
              </WizardPanel>
            )}

            {step === 3 && (
              <WizardPanel eyebrow="Шаг 4" title="Как должен выглядеть магазин?">
                <div className="grid gap-3 md:grid-cols-2">
                  {visualPacks.map((theme) => (
                    <button
                      key={theme.code}
                      onClick={() => setForm({ ...form, style: theme.code, niche: theme.category })}
                      className={`group overflow-hidden rounded-2xl border bg-white/98 text-left shadow-sm transition duration-200 ease-premium hover:-translate-y-1 hover:border-sea/25 hover:shadow-premium hover:ring-2 hover:ring-sea/10 ${form.style === theme.code ? "border-sea/50 ring-4 ring-sea/15 shadow-[0_20px_50px_rgba(10,13,18,0.12)]" : "border-line/90"}`}
                    >
                      <div className="relative h-32 overflow-hidden">
                        <Image src={theme.image} alt="" fill className="object-cover transition duration-500 ease-premium group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 480px" />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/72 via-ink/12 to-transparent" />
                        <span className="absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-md" style={{ background: theme.accent }}>{theme.title}</span>
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-semibold">{theme.mood} стиль</p>
                        <p className="mt-1 text-xs leading-5 text-neutral-500">{theme.tagline}</p>
                        <p className="mt-2 text-[11px] font-semibold text-neutral-400">{theme.structure.slice(0, 3).join(" · ")}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </WizardPanel>
            )}

            {step === 4 && (
              <WizardPanel eyebrow="Шаг 5" title="Сгенерировать магазин?">
                <div className="grid gap-3">
                  {generationTasks.map((task, index) => {
                    const active = loading && index <= generationIndex;
                    const done = loading && index < generationIndex;
                    return (
                      <div
                        key={task}
                        className={`flex items-center gap-4 rounded-2xl border p-4 transition duration-200 ease-premium ${active ? "border-mint/35 bg-gradient-to-r from-mint/[0.12] to-sea/[0.06] shadow-sm" : "border-line/90 bg-paper/80"}`}
                      >
                        <span
                          className={`grid h-11 w-11 place-items-center rounded-xl ring-1 ${active ? "bg-mint text-white shadow-md ring-mint/30" : "bg-white text-neutral-400 ring-line/80"}`}
                        >
                          {done ? <Check size={18} /> : <Wand2 size={18} className={active ? "animate-soft-pulse" : ""} />}
                        </span>
                        <div>
                          <p className="text-sm font-semibold">{task}</p>
                          <p className="mt-1 text-xs text-neutral-500">{active ? "Готовим premium-витрину" : "Ожидает генерации"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button onClick={finish} loading={loading} size="lg" className="mt-6 w-full sm:w-auto">
                  <Sparkles size={18} />Сгенерировать магазин
                </Button>
              </WizardPanel>
            )}

            {step === 5 && store && (
              <SuccessScreen
                store={store}
                storePath={storePath}
                publicUrl={publicUrl}
                shareText={shareText}
                themeAccent={selectedTheme.accent}
                onCopy={copyLink}
              />
            )}

            {step < 4 && (
              <div className="mt-8 flex items-center justify-between gap-3">
                <Button variant="ghost" onClick={() => setStep(Math.max(step - 1, 0))} disabled={step === 0}>
                  <ArrowLeft size={17} />Назад
                </Button>
                <Button
                  variant="dark"
                  onClick={() => {
                    if (!canGoNext(step)) {
                      showToast("Заполните обязательные поля, чтобы продолжить");
                      return;
                    }
                    setStep(step + 1);
                  }}
                >
                  Дальше <ArrowRight size={17} />
                </Button>
              </div>
            )}
          </section>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="mb-3 flex items-center justify-between rounded-xl border border-line/90 bg-white/95 px-3 py-2.5 text-xs font-bold text-neutral-700 shadow-sm ring-1 ring-white/60 backdrop-blur-sm">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint/60 opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
                </span>
                Живой предпросмотр
              </span>
              <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-500">mobile-first</span>
            </div>
            <PhonePreview form={form} theme={selectedTheme} />
          </aside>
        </div>
      </section>
    </main>
  );
}

function WizardPanel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="relative z-10 animate-reveal">
      <Badge tone="blue">{eyebrow}</Badge>
      <h2 className="mt-5 max-w-2xl text-3xl font-extrabold leading-[1.1] text-balance tracking-tight md:text-5xl md:leading-[1.08]">{title}</h2>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function ChoiceCard({ title, subtitle, active, icon, onClick }: { title: string; subtitle: string; active: boolean; icon: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring group relative min-h-[168px] overflow-hidden rounded-2xl border p-5 text-left transition duration-200 ease-premium hover:-translate-y-1 hover:shadow-premium ${
        active
          ? "border-sea/40 bg-gradient-to-br from-ink via-[#121826] to-sea text-white shadow-[0_28px_70px_rgba(10,13,18,0.28)] ring-2 ring-sea/25"
          : "border-line/90 bg-white/95 hover:border-sea/20 hover:ring-1 hover:ring-sea/10"
      }`}
    >
      {active && <span className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-sea/25 blur-2xl" aria-hidden />}
      <div className="relative flex items-start justify-between gap-3">
        <span
          className={`grid h-12 w-12 place-items-center rounded-2xl ring-1 transition duration-200 ease-premium ${
            active ? "bg-white/15 text-white ring-white/20" : "bg-gradient-to-br from-sea/10 to-berry/5 text-sea ring-sea/10 group-hover:from-sea/15"
          }`}
        >
          <span className="text-lg" aria-hidden>
            {icon}
          </span>
        </span>
        {active && <CheckCircle2 size={20} className="shrink-0 text-mint" />}
      </div>
      <p className="relative mt-5 text-lg font-bold tracking-tight">{title}</p>
      <p className={`relative mt-2 text-sm leading-6 ${active ? "text-white/75" : "text-neutral-600"}`}>{subtitle}</p>
    </button>
  );
}

function PhonePreview({ form, theme }: { form: { niche: string; name: string; city: string; region: string; telegram: string }; theme: (typeof storefrontThemes)[number] }) {
  return (
    <div className="relative rounded-[32px] border border-neutral-800/90 bg-gradient-to-b from-neutral-900 to-ink p-3 shadow-[0_32px_80px_rgba(10,13,18,0.35)] ring-1 ring-white/10">
      <div className="pointer-events-none absolute inset-x-8 top-2 h-1 rounded-full bg-neutral-700/80" aria-hidden />
      <div className="overflow-hidden rounded-[24px] ring-1 ring-white/5" style={{ background: theme.bg, color: theme.text }}>
        <div className="relative h-72 overflow-hidden">
          <Image src={theme.image} alt="" fill className="object-cover" sizes="360px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/18 to-transparent" />
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
            <span className="rounded-full bg-white/88 px-3 py-1 text-[11px] font-semibold text-ink">{theme.title}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/88 text-sm text-ink" aria-hidden>🎨</span>
          </div>
          <div className="absolute bottom-5 left-4 right-4 text-white">
            <p className="text-xs font-semibold" style={{ color: theme.accent }}>{form.city} · заказ сегодня</p>
            <h3 className="mt-2 text-3xl font-semibold leading-none">{form.name}</h3>
            <p className="mt-3 text-sm leading-5 text-white/72">{theme.tagline}</p>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2">
            {theme.copy.map((item) => (
              <div key={item} className="rounded-xl p-2 text-center text-[11px] font-semibold ring-1 ring-black/[0.04]" style={{ background: theme.surface }}>{item}</div>
            ))}
          </div>
          <div className="mt-4 grid gap-3">
            {[theme.productImage, "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80"].map((image, index) => (
              <div key={image} className="flex items-center gap-3 rounded-xl p-2" style={{ background: theme.surface }}>
                <Image src={image} alt="" width={64} height={64} className="h-16 w-16 rounded-xl object-cover ring-1 ring-black/[0.06]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{index === 0 ? theme.category : form.niche}</p>
                  <p className="mt-1 text-xs opacity-60">от {index === 0 ? "4 500" : "2 900"} ₽</p>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-md" style={{ background: theme.accent }}><ArrowRight size={15} /></span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl p-3 text-sm font-semibold text-white shadow-md" style={{ background: theme.accent }}>
            <span>Заказать в Telegram</span>
            <Send size={16} />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs opacity-65"><MapPin size={13} />{form.region}, {form.city}</div>
          <div className="mt-2 flex items-center gap-2 text-xs opacity-65"><MessageCircle size={13} />{form.telegram}</div>
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({
  store,
  storePath,
  publicUrl,
  shareText,
  themeAccent,
  onCopy
}: {
  store: Store;
  storePath: string;
  publicUrl: string;
  shareText: string;
  themeAccent: string;
  onCopy: () => void;
}) {
  return (
    <div className="relative animate-reveal overflow-hidden rounded-2xl border border-line/90 bg-white/98 p-5 shadow-[0_28px_90px_rgba(10,13,18,0.1)] ring-1 ring-white/70 backdrop-blur-sm md:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sea via-mint to-saffron" aria-hidden />
      <Confetti />
      <Badge tone="green">Готово</Badge>
      <h2 className="mt-5 max-w-2xl text-4xl font-extrabold leading-[1.08] text-balance tracking-tight md:text-6xl md:leading-[1.05]">
        Магазин готов к <span className="bg-gradient-to-r from-sea to-mint bg-clip-text text-transparent">первому заказу</span>
      </h2>
      <div className="relative z-10 mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="rounded-2xl border border-line/80 bg-gradient-to-b from-paper to-white p-5 shadow-inner">
          <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Публичная ссылка</p>
          <p className="mt-3 break-all text-lg font-extrabold leading-snug md:text-xl">{publicUrl}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-line/90 bg-white px-4 text-sm font-semibold shadow-sm transition duration-200 ease-premium hover:-translate-y-px hover:bg-paper"
            >
              <Copy size={17} />
              Скопировать
            </button>
            <a
              href={`https://wa.me/?text=${shareText}`}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-mint to-emerald-600 px-4 text-sm font-semibold text-white shadow-md transition duration-200 ease-premium hover:-translate-y-px hover:brightness-110"
            >
              <MessageCircle size={17} />
              WhatsApp
            </a>
            <a
              href={`https://t.me/share/url?url=${shareText}`}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-sea to-cyan-700 px-4 text-sm font-semibold text-white shadow-md transition duration-200 ease-premium hover:-translate-y-px hover:brightness-110"
            >
              <Send size={17} />
              Telegram
            </a>
          </div>
        </div>
        <div className="rounded-2xl border border-line/90 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold">
            <QrCode size={17} className="text-sea" />
            QR-код магазина
          </div>
          <QRCodeMock accent={themeAccent} />
        </div>
      </div>
      <div className="relative z-10 mt-7 grid gap-3 sm:grid-cols-2">
        <Link
          href="/dashboard"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-ink to-sea px-5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(10,13,18,0.22)] transition duration-200 ease-premium hover:-translate-y-px hover:brightness-110"
        >
          <PackagePlus size={18} />
          Перейти в кабинет
        </Link>
        <Link
          href={storePath || `/store/${store.slug}`}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-line/90 bg-white px-5 text-sm font-semibold shadow-sm transition duration-200 ease-premium hover:-translate-y-px hover:bg-paper"
        >
          <ArrowRight size={18} />
          Посмотреть магазин
        </Link>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="relative z-10 mt-4 inline-flex h-11 items-center gap-2 rounded-2xl border border-dashed border-line/90 bg-paper/50 px-4 text-sm font-semibold transition duration-200 ease-premium hover:border-sea/30 hover:bg-white"
      >
        <Share2 size={17} />
        Поделиться витриной
      </button>
    </div>
  );
}

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {["#8B3258", "#3D8F62", "#C9891F", "#1D6F82", "#0A0D12", "#5C4B8A"].map((color, index) => (
        <span key={color} className="confetti-piece absolute top-0 h-3 w-2 rounded-sm" style={{ left: `${12 + index * 14}%`, background: color, animationDelay: `${index * 0.07}s` }} />
      ))}
    </div>
  );
}

function QRCodeMock({ accent }: { accent: string }) {
  const cells = Array.from({ length: 81 }, (_, index) => index % 2 === 0 || index % 9 === 0 || [10, 14, 18, 42, 58, 70].includes(index));
  return (
    <div className="grid aspect-square w-full grid-cols-9 gap-1 rounded-xl border border-line/60 bg-paper p-2 shadow-inner">
      {cells.map((active, index) => <span key={index} className="rounded-[3px]" style={{ background: active ? (index % 4 === 0 ? accent : "#0A0D12") : "#FFFFFF" }} />)}
    </div>
  );
}
