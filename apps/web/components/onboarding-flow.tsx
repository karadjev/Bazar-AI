"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, Check, Download, MapPin, MessageCircle, Plus, QrCode, Send, Share2, Sparkles, Store as StoreIcon, Wand2 } from "lucide-react";
import { api, registerDemo, Store } from "@/lib/api";
import { Badge, Button, Card, Field, Stepper } from "@/components/ui-kit";
import { storefrontThemes, themeByNiche } from "@/lib/themes";

const niches = ["Женская одежда", "Косметика", "Халяль-продукты", "Парфюм", "Торты", "Исламские товары", "Техника", "Локальный бренд"];
const generationTasks = ["Создаем название", "Подбираем цвета", "Генерируем витрину", "Добавляем товары", "Готовим ссылку"];

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generationIndex, setGenerationIndex] = useState(0);
  const [store, setStore] = useState<Store | null>(null);
  const [form, setForm] = useState({
    email: "demo@bazar.ai",
    password: "demo-password",
    niche: "Женская одежда",
    name: "Kavkaz Style",
    region: "Ингушетия",
    city: "Магас",
    phone: "+79000000000",
    whatsapp: "+79000000000",
    telegram: "@bazar_demo",
    style: "premium-fashion"
  });

  const selectedTheme = useMemo(() => storefrontThemes.find((theme) => theme.code === form.style) || themeByNiche(form.niche), [form.style, form.niche]);
  const storePath = store ? `/store/${store.slug}` : `/store/${form.name.toLowerCase().replaceAll(" ", "-")}`;
  const shareText = encodeURIComponent(`Мой магазин ${form.name}: ${typeof window !== "undefined" ? location.origin : ""}${storePath}`);
  const steps = ["Ниша", "Город", "Контакты", "Стиль", "Генерация", "Готово"];

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => setGenerationIndex((value) => Math.min(value + 1, generationTasks.length - 1)), 720);
    return () => clearInterval(interval);
  }, [loading]);

  async function finish() {
    setLoading(true);
    setGenerationIndex(0);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    try {
      await registerDemo(form.email, form.password).catch(async () => {
        const login = await api<{ access_token: string; refresh_token: string }>("/api/v1/auth/login", {
          method: "POST",
          body: JSON.stringify({ login: form.email, password: form.password })
        });
        localStorage.setItem("bazar_access_token", login.access_token);
        localStorage.setItem("bazar_refresh_token", login.refresh_token);
      });
      const result = await api<{ store: Store; public_url: string }>("/api/v1/onboarding/complete", {
        method: "POST",
        body: JSON.stringify({
          niche: form.niche,
          name: form.name,
          region: form.region,
          city: form.city,
          style: form.style,
          contacts: { phone: form.phone, whatsapp: form.whatsapp, telegram: form.telegram }
        })
      });
      setStore(result.store);
    } catch {
      setStore({
        id: "demo_store",
        name: form.name,
        slug: "kavkaz-style",
        description: `AI-магазин для ниши: ${form.niche}`,
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

  return (
    <main className="min-h-screen bg-paper text-ink premium-grid">
      <section className="mx-auto max-w-7xl px-4 py-4 md:px-6">
        <header className="glass-panel sticky top-3 z-20 flex items-center justify-between rounded-lg px-4 py-3 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white"><StoreIcon size={20} /></div>
            <div>
              <p className="text-sm font-semibold">Bazar AI</p>
              <p className="text-xs text-neutral-500">Wizard запуска магазина</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold transition hover:bg-neutral-50">Главная</Link>
            <Link href="/dashboard" className="hidden rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold transition hover:bg-neutral-50 sm:inline-flex">Dashboard</Link>
          </div>
        </header>

        <div className="grid gap-4 py-5 lg:grid-cols-[320px_1fr]">
          <Card className="h-fit p-4">
            <div className="mb-5">
              <Badge tone="gold">Premium onboarding</Badge>
              <h1 className="mt-3 text-2xl font-semibold leading-tight">Собираем магазин, который можно отправить клиенту.</h1>
            </div>
            <Stepper steps={steps} active={step} />
            <div className="space-y-2">
              {steps.map((item, index) => (
                <button key={item} onClick={() => index < 4 && setStep(index)} className={`flex w-full items-center gap-3 rounded-md p-3 text-left transition ${index === step ? "bg-ink text-white" : index < step ? "bg-mint/10 text-ink" : "text-neutral-500 hover:bg-neutral-100"}`}>
                  <span className={`grid h-7 w-7 place-items-center rounded-md ${index <= step ? "bg-white text-ink" : "bg-neutral-100"}`}>{index < step ? <Check size={15} /> : index + 1}</span>
                  <span className="text-sm font-semibold">{item}</span>
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-line bg-paper p-3">
              <p className="text-xs text-neutral-500">Live preview</p>
              <p className="mt-1 text-sm font-semibold">{form.name}</p>
              <p className="text-xs text-neutral-500">{form.city} · {selectedTheme.title}</p>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="grid min-h-[640px] lg:grid-cols-[1fr_360px]">
              <section className="p-5 md:p-9">
                {step === 0 && (
                  <Panel eyebrow="Шаг 1" title="Чем вы занимаетесь?" hint="AI подстроит структуру витрины, тексты и CTA под вашу нишу.">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {niches.map((niche) => (
                        <Choice key={niche} active={form.niche === niche} onClick={() => {
                          const theme = themeByNiche(niche);
                          setForm({ ...form, niche, style: theme.code, name: niche === "Парфюм" ? "Oud House" : niche === "Халяль-продукты" ? "Halal Basket" : niche === "Женская одежда" ? "Amina Wear" : form.name });
                        }} title={niche} subtitle={`${themeByNiche(niche).title} pack`} />
                      ))}
                    </div>
                  </Panel>
                )}
                {step === 1 && (
                  <Panel eyebrow="Шаг 2" title="Где продаете?" hint="Регион влияет на тексты доставки, доверие и локальную подачу магазина.">
                    <Field label="Название магазина" value={form.name} onChange={(name) => setForm({ ...form, name })} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Регион" value={form.region} onChange={(region) => setForm({ ...form, region })} />
                      <Field label="Город" value={form.city} onChange={(city) => setForm({ ...form, city })} />
                    </div>
                  </Panel>
                )}
                {step === 2 && (
                  <Panel eyebrow="Шаг 3" title="Куда отправлять заказы?" hint="Telegram и WhatsApp становятся главными каналами продаж.">
                    <Field label="Телефон" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="WhatsApp" value={form.whatsapp} onChange={(whatsapp) => setForm({ ...form, whatsapp })} />
                      <Field label="Telegram" value={form.telegram} onChange={(telegram) => setForm({ ...form, telegram })} />
                    </div>
                  </Panel>
                )}
                {step === 3 && (
                  <Panel eyebrow="Шаг 4" title="Какой стиль магазина хотите?" hint="Темы отличаются композицией, настроением, карточками и визуальной логикой.">
                    <div className="grid gap-3 md:grid-cols-2">
                      {storefrontThemes.map((theme) => (
                        <button key={theme.code} onClick={() => setForm({ ...form, style: theme.code })} className={`overflow-hidden rounded-lg border text-left transition hover:-translate-y-0.5 hover:shadow-soft ${form.style === theme.code ? "border-ink" : "border-line"}`}>
                          <div className="h-24" style={{ background: `linear-gradient(135deg, ${theme.bg}, ${theme.accent})` }} />
                          <div className="p-3">
                            <p className="text-sm font-semibold">{theme.title}</p>
                            <p className="mt-1 text-xs text-neutral-500">{theme.mood} · {theme.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Panel>
                )}
                {step === 4 && (
                  <Panel eyebrow="Шаг 5" title="AI собирает магазин" hint="Сейчас Bazar AI собирает витрину, тексты, тему и публичную ссылку.">
                    <div className="space-y-3">
                      {generationTasks.map((task, index) => (
                        <div key={task} className={`flex items-center gap-3 rounded-md border p-3 transition ${index <= generationIndex && loading ? "border-mint bg-mint/10" : "border-line bg-paper"}`}>
                          <span className={`grid h-8 w-8 place-items-center rounded-md ${index <= generationIndex && loading ? "bg-mint text-white" : "bg-white text-neutral-400"}`}>{index < generationIndex && loading ? <Check size={16} /> : <Wand2 size={16} />}</span>
                          <span className="text-sm font-semibold">{task}</span>
                        </div>
                      ))}
                    </div>
                    <Button onClick={finish} loading={loading} className="mt-5">Сгенерировать магазин</Button>
                  </Panel>
                )}
                {step === 5 && store && (
                  <div className="relative">
                    <Confetti />
                    <Panel eyebrow="Шаг 6" title="Ваш магазин готов" hint="Теперь можно добавить первый товар, открыть витрину и отправить ссылку клиентам.">
                      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                        <div className="rounded-lg border border-line bg-paper p-4">
                          <p className="text-sm text-neutral-500">Публичная ссылка</p>
                          <p className="mt-1 break-all text-xl font-semibold">{storePath}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <a href={`https://wa.me/?text=${shareText}`} className="inline-flex h-10 items-center gap-2 rounded-md bg-mint px-3 text-sm font-semibold text-white"><MessageCircle size={16} />WhatsApp</a>
                            <a href={`https://t.me/share/url?url=${shareText}`} className="inline-flex h-10 items-center gap-2 rounded-md bg-sea px-3 text-sm font-semibold text-white"><Send size={16} />Telegram</a>
                            <button className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold"><Download size={16} />QR</button>
                          </div>
                        </div>
                        <div className="rounded-lg border border-line bg-white p-4">
                          <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><QrCode size={17} />QR магазина</div>
                          <QRCodeMock />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href="/dashboard" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"><Plus size={17} />Добавить первый товар</Link>
                        <Link href={`/store/${store.slug}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold transition hover:bg-neutral-50"><ArrowRight size={17} />Посмотреть магазин</Link>
                        <Button variant="secondary"><Share2 size={17} />Поделиться</Button>
                      </div>
                    </Panel>
                  </div>
                )}

                {step < 4 && (
                  <div className="mt-8 flex flex-wrap justify-between gap-2">
                    <Button variant="ghost" onClick={() => setStep(Math.max(step - 1, 0))}>Назад</Button>
                    <Button variant="dark" onClick={() => setStep(step + 1)}>Дальше <ArrowRight size={17} /></Button>
                  </div>
                )}
              </section>

              <aside className="border-t border-line bg-ink p-4 text-white lg:border-l lg:border-t-0">
                <div className="relative min-h-[560px] overflow-hidden rounded-lg" style={{ background: selectedTheme.bg, color: selectedTheme.text }}>
                  <img src={selectedTheme.image} alt="" className="h-56 w-full object-cover" />
                  <div className="p-4">
                    <Badge tone="gold">{selectedTheme.mood}</Badge>
                    <h2 className="mt-4 text-3xl font-semibold leading-tight">{form.name}</h2>
                    <p className="mt-2 text-sm font-semibold" style={{ color: selectedTheme.accent }}>{selectedTheme.tagline}</p>
                    <p className="mt-3 text-sm leading-6 opacity-75">{form.niche} · {form.city}. Заказы через Telegram и WhatsApp.</p>
                    <div className="mt-5 grid gap-2">
                      <div className="rounded-md p-3 text-sm font-semibold" style={{ background: selectedTheme.surface }}>{selectedTheme.structure.slice(0, 3).join(" · ")}</div>
                      <div className="rounded-md p-3 text-sm font-semibold" style={{ background: selectedTheme.accent, color: "#fff" }}>Заказать сегодня</div>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {selectedTheme.copy.map((item) => <div key={item} className="rounded-md p-2 text-[11px] font-semibold" style={{ background: selectedTheme.surface }}>{item}</div>)}
                    </div>
                    <div className="mt-5 flex items-center gap-2 text-xs opacity-70"><MapPin size={14} />{form.region}, {form.city}</div>
                    <div className="mt-2 flex items-center gap-2 text-xs opacity-70"><MessageCircle size={14} />{form.telegram}</div>
                  </div>
                </div>
              </aside>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}

function Panel({ eyebrow, title, hint, children }: { eyebrow: string; title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="animate-rise">
      <Badge tone="blue">{eyebrow}</Badge>
      <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">{title}</h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-600 md:text-base">{hint}</p>
      <div className="mt-7 space-y-3">{children}</div>
    </div>
  );
}

function Choice({ title, subtitle, active, onClick }: { title: string; subtitle: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft ${active ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{title}</p>
        {active && <BadgeCheck size={17} />}
      </div>
      <p className={`mt-2 text-xs ${active ? "text-white/[0.65]" : "text-neutral-500"}`}>{subtitle}</p>
    </button>
  );
}

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {["#9A365F", "#5BA97D", "#E7A83E", "#277C8E", "#141414"].map((color, index) => (
        <span key={color} className="confetti-piece absolute top-0 h-3 w-2 rounded-sm" style={{ left: `${18 + index * 14}%`, background: color, animationDelay: `${index * 0.08}s` }} />
      ))}
    </div>
  );
}

function QRCodeMock() {
  const cells = Array.from({ length: 49 }, (_, index) => index % 2 === 0 || index % 7 === 0 || [8, 12, 36, 40].includes(index));
  return (
    <div className="grid aspect-square w-full grid-cols-7 gap-1 rounded-md bg-paper p-2">
      {cells.map((active, index) => <span key={index} className={`rounded-sm ${active ? "bg-ink" : "bg-white"}`} />)}
    </div>
  );
}
