"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CakeSlice,
  Check,
  CheckCircle2,
  Copy,
  Gem,
  MapPin,
  MessageCircle,
  PackagePlus,
  Palette,
  QrCode,
  Send,
  Share2,
  Shirt,
  ShoppingBasket,
  Sparkles,
  Store as StoreIcon,
  Wand2,
  type LucideIcon
} from "lucide-react";
import { api, createStoreOnboarding, registerDemo, setSession, Store } from "@/lib/api";
import { Badge, Button, Field, Stepper, Toast } from "@/components/ui-kit";
import { storefrontThemes, themeByNiche } from "@/lib/themes";

type Niche = {
  title: string;
  subtitle: string;
  city: string;
  storeName: string;
  icon: LucideIcon;
};

const niches: Niche[] = [
  { title: "Женская одежда", subtitle: "коллекции, размеры, подбор образа", city: "Магас", storeName: "Amina Wear", icon: Shirt },
  { title: "Парфюм", subtitle: "подарочные наборы и premium карточки", city: "Грозный", storeName: "Oud House", icon: Gem },
  { title: "Халяль-продукты", subtitle: "категории, доставка, быстрый заказ", city: "Назрань", storeName: "Halal Basket", icon: ShoppingBasket },
  { title: "Торты", subtitle: "события, фото, заявка за минуту", city: "Махачкала", storeName: "Cake Atelier", icon: CakeSlice },
  { title: "Исламские товары", subtitle: "книги, подарки, спокойная подача", city: "Дербент", storeName: "Iman Store", icon: BadgeCheck },
  { title: "Локальный бренд", subtitle: "доверие, история, заказы в Telegram", city: "Владикавказ", storeName: "Kavkaz Studio", icon: Building2 }
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
    if (!loading) return;
    const interval = setInterval(() => setGenerationIndex((value) => Math.min(value + 1, generationTasks.length - 1)), 620);
    return () => clearInterval(interval);
  }, [loading]);

  async function finish() {
    setLoading(true);
    setGenerationIndex(0);
    await new Promise((resolve) => setTimeout(resolve, 2300));
    try {
      await registerDemo(form.email, form.password).catch(async () => {
        const login = await api<{ access_token: string; refresh_token: string }>("/api/v1/auth/login", {
          method: "POST",
          body: JSON.stringify({ login: form.email, password: form.password })
        });
        setSession(login.access_token, login.refresh_token);
      });
      const result = await createStoreOnboarding({
        niche: form.niche,
        name: form.name,
        region: form.region,
        city: form.city,
        style: form.style,
        contacts: { phone: form.phone, whatsapp: form.whatsapp, telegram: form.telegram }
      });
      setStore(result.store);
    } catch {
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

  return (
    <main className="min-h-screen bg-paper text-ink premium-grid">
      {toast && <Toast>{toast}</Toast>}
      <header className="sticky top-0 z-30 border-b border-line/80 bg-white/88 backdrop-blur-xl">
        <div className="shell flex items-center justify-between gap-3 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white shadow-float"><StoreIcon size={20} /></span>
            <span>
              <span className="block text-sm font-semibold">Bazar AI</span>
              <span className="block text-xs font-medium text-neutral-500">Запуск магазина</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hidden h-10 items-center rounded-md border border-line bg-white px-3 text-sm font-semibold transition hover:bg-neutral-50 sm:inline-flex">Dashboard</Link>
            <a href={storePath} className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-white transition hover:bg-neutral-800">Preview <ArrowRight size={16} /></a>
          </div>
        </div>
      </header>

      <section className="shell py-5 md:py-8">
        <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <Badge tone="gold">Premium wizard</Badge>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-balance md:text-6xl">
              Соберите витрину, которую можно сразу отправить клиенту
            </h1>
          </div>
          <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
            <Stepper steps={steps} active={step} />
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_390px]">
          <aside className="hidden xl:block">
            <div className="sticky top-24 rounded-2xl border border-line bg-white p-4 shadow-soft">
              <p className="text-xs font-semibold uppercase text-neutral-500">Прогресс запуска</p>
              <div className="mt-4 space-y-2">
                {steps.map((item, index) => (
                  <div key={item} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${index === step ? "border-ink bg-ink text-white" : index < step ? "border-mint/30 bg-mint/10 text-neutral-800" : "border-line bg-paper text-neutral-500"}`}>
                    {index + 1}. {item}
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-paper p-3">
                <p className="text-xs font-semibold text-neutral-500">Текущий магазин</p>
                <p className="mt-1 text-sm font-semibold">{form.name}</p>
                <p className="mt-1 text-xs text-neutral-500">{form.city}, {form.region}</p>
              </div>
            </div>
          </aside>

          <section className="rounded-lg border border-line bg-white p-4 shadow-premium md:p-7">
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
                  <div className="rounded-lg border border-line bg-paper p-4">
                    <MapPin size={18} className="text-sea" />
                    <p className="mt-3 text-sm font-semibold">{form.city || "Город"}</p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">Эта география попадет в доставку, доверие и CTA.</p>
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
                  {["Telegram order", "WhatsApp checkout", "Звонок клиенту"].map((item, index) => (
                    <div key={item} className="rounded-lg border border-line bg-paper p-4">
                      <span className="grid h-9 w-9 place-items-center rounded-md bg-white text-sea shadow-sm">{index === 0 ? <Send size={17} /> : index === 1 ? <MessageCircle size={17} /> : <CheckCircle2 size={17} />}</span>
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
                      className={`group overflow-hidden rounded-lg border bg-white text-left transition duration-200 hover:-translate-y-1 hover:shadow-premium ${form.style === theme.code ? "border-ink ring-4 ring-ink/8" : "border-line"}`}
                    >
                      <div className="relative h-32 overflow-hidden">
                        <Image src={theme.image} alt="" fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 480px" />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/72 via-ink/12 to-transparent" />
                        <span className="absolute bottom-3 left-3 rounded-md px-2 py-1 text-xs font-semibold text-white" style={{ background: theme.accent }}>{theme.title}</span>
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-semibold">{theme.mood} visual pack</p>
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
                      <div key={task} className={`flex items-center gap-3 rounded-lg border p-4 transition ${active ? "border-mint bg-mint/10" : "border-line bg-paper"}`}>
                        <span className={`grid h-10 w-10 place-items-center rounded-md ${active ? "bg-mint text-white" : "bg-white text-neutral-400"}`}>
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
                <Button variant="dark" onClick={() => setStep(step + 1)}>
                  Дальше <ArrowRight size={17} />
                </Button>
              </div>
            )}
          </section>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <PhonePreview form={form} theme={selectedTheme} />
          </aside>
        </div>
      </section>
    </main>
  );
}

function WizardPanel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="animate-reveal">
      <Badge tone="blue">{eyebrow}</Badge>
      <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight text-balance md:text-5xl">{title}</h2>
      <div className="mt-7">{children}</div>
    </div>
  );
}

function ChoiceCard({ title, subtitle, active, icon: Icon, onClick }: { title: string; subtitle: string; active: boolean; icon: LucideIcon; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`min-h-[156px] rounded-lg border p-4 text-left transition duration-200 hover:-translate-y-1 hover:shadow-premium ${active ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-md ${active ? "bg-white text-ink" : "bg-paper text-sea"}`}><Icon size={20} /></span>
        {active && <CheckCircle2 size={19} />}
      </div>
      <p className="mt-5 text-lg font-semibold">{title}</p>
      <p className={`mt-2 text-sm leading-5 ${active ? "text-white/70" : "text-neutral-500"}`}>{subtitle}</p>
    </button>
  );
}

function PhonePreview({ form, theme }: { form: { niche: string; name: string; city: string; region: string; telegram: string }; theme: (typeof storefrontThemes)[number] }) {
  return (
    <div className="rounded-[28px] border border-ink/10 bg-ink p-3 shadow-premium">
      <div className="overflow-hidden rounded-[22px]" style={{ background: theme.bg, color: theme.text }}>
        <div className="relative h-72 overflow-hidden">
          <Image src={theme.image} alt="" fill className="object-cover" sizes="360px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/18 to-transparent" />
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
            <span className="rounded-full bg-white/88 px-3 py-1 text-[11px] font-semibold text-ink">{theme.title}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/88 text-ink"><Palette size={15} /></span>
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
              <div key={item} className="rounded-md p-2 text-center text-[11px] font-semibold" style={{ background: theme.surface }}>{item}</div>
            ))}
          </div>
          <div className="mt-4 grid gap-3">
            {[theme.productImage, "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80"].map((image, index) => (
              <div key={image} className="flex items-center gap-3 rounded-lg p-2" style={{ background: theme.surface }}>
                <Image src={image} alt="" width={64} height={64} className="h-16 w-16 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{index === 0 ? theme.category : form.niche}</p>
                  <p className="mt-1 text-xs opacity-60">от {index === 0 ? "4 500" : "2 900"} ₽</p>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-md text-white" style={{ background: theme.accent }}><ArrowRight size={15} /></span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg p-3 text-sm font-semibold text-white" style={{ background: theme.accent }}>
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
    <div className="relative animate-reveal overflow-hidden rounded-lg border border-line bg-white p-4 md:p-7">
      <Confetti />
      <Badge tone="green">Готово</Badge>
      <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-balance md:text-6xl">Магазин готов к первому заказу</h2>
      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="rounded-lg border border-line bg-paper p-4">
          <p className="text-xs font-semibold text-neutral-500">Публичная ссылка</p>
          <p className="mt-2 break-all text-xl font-semibold">{publicUrl}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={onCopy} className="inline-flex h-11 items-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold transition hover:bg-neutral-50"><Copy size={17} />Скопировать</button>
            <a href={`https://wa.me/?text=${shareText}`} className="inline-flex h-11 items-center gap-2 rounded-md bg-mint px-4 text-sm font-semibold text-white"><MessageCircle size={17} />WhatsApp</a>
            <a href={`https://t.me/share/url?url=${shareText}`} className="inline-flex h-11 items-center gap-2 rounded-md bg-sea px-4 text-sm font-semibold text-white"><Send size={17} />Telegram</a>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-white p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><QrCode size={17} />QR магазина</div>
          <QRCodeMock accent={themeAccent} />
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/dashboard" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 text-sm font-semibold text-white transition hover:bg-neutral-800">
          <PackagePlus size={18} />Добавить первый товар
        </Link>
        <Link href={storePath || `/store/${store.slug}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-line bg-white px-5 text-sm font-semibold transition hover:bg-neutral-50">
          <ArrowRight size={18} />Посмотреть магазин
        </Link>
      </div>
      <button onClick={onCopy} className="mt-3 inline-flex h-11 items-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold transition hover:bg-neutral-50">
        <Share2 size={17} />Поделиться витриной
      </button>
    </div>
  );
}

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {["#92385F", "#4F9F73", "#D99A2B", "#247C8D", "#0D1117", "#B85C82"].map((color, index) => (
        <span key={color} className="confetti-piece absolute top-0 h-3 w-2 rounded-sm" style={{ left: `${12 + index * 14}%`, background: color, animationDelay: `${index * 0.07}s` }} />
      ))}
    </div>
  );
}

function QRCodeMock({ accent }: { accent: string }) {
  const cells = Array.from({ length: 81 }, (_, index) => index % 2 === 0 || index % 9 === 0 || [10, 14, 18, 42, 58, 70].includes(index));
  return (
    <div className="grid aspect-square w-full grid-cols-9 gap-1 rounded-md bg-paper p-2">
      {cells.map((active, index) => <span key={index} className="rounded-[2px]" style={{ background: active ? (index % 4 === 0 ? accent : "#0D1117") : "#FFFFFF" }} />)}
    </div>
  );
}
