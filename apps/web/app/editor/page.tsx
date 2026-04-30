"use client";

import { useEffect, useState } from "react";
import { GripVertical, History, Laptop, MessageCircle, MonitorSmartphone, PanelRight, Redo2, Smartphone, Sparkles, Undo2 } from "lucide-react";
import { Badge, Button, Card, Field, Tabs, Toast } from "@/components/ui-kit";
import { storefrontThemes } from "@/lib/themes";
import { AIActions } from "@/components/ai-actions";

const blocks = ["hero", "товары", "категории", "отзывы", "акции", "доставка", "FAQ", "контакты", "Instagram/Telegram CTA"];
const quickStyles = ["Premium", "Editorial", "Minimal", "Local", "Contrast"];

export default function StoreEditorPage() {
  const [activeBlock, setActiveBlock] = useState("hero");
  const [preview, setPreview] = useState("Desktop");
  const [theme, setTheme] = useState(storefrontThemes[0]);
  const [toast, setToast] = useState("");
  const [settings, setSettings] = useState({ title: "Kavkaz Style", button: "Заказать сегодня", color: theme.accent });
  const [history, setHistory] = useState(["Первичная версия"]);
  const [future, setFuture] = useState<string[]>([]);
  const [autosaved, setAutosaved] = useState("только что");

  useEffect(() => {
    const timer = setTimeout(() => setAutosaved("автосохранено"), 900);
    return () => clearTimeout(timer);
  }, [settings, theme, activeBlock]);

  function save() {
    setToast("Изменения сохранены");
    setHistory([`Версия ${history.length + 1}: ${activeBlock}`, ...history].slice(0, 5));
    setTimeout(() => setToast(""), 2200);
  }

  function updateSettings(next: typeof settings) {
    setFuture([]);
    setSettings(next);
  }

  function undo() {
    setFuture([settings.title, ...future]);
    setSettings({ ...settings, title: history[0] || settings.title });
    setToast("Шаг отменен");
  }

  function redo() {
    if (!future[0]) return;
    setSettings({ ...settings, title: future[0] });
    setFuture(future.slice(1));
    setToast("Шаг возвращен");
  }

  function aiRedesign() {
    const next = storefrontThemes[(storefrontThemes.findIndex((item) => item.code === theme.code) + 1) % storefrontThemes.length];
    setTheme(next);
    setSettings({ ...settings, color: next.accent, button: "Запустить заказ" });
    setToast("AI сделал магазин красивее");
  }

  return (
    <main className="min-h-screen bg-paper text-ink premium-grid">
      {toast && <Toast>{toast}</Toast>}
      <header className="glass-panel sticky top-3 z-20 mx-auto mt-3 flex max-w-7xl items-center justify-between rounded-lg px-4 py-3 shadow-soft">
        <div>
          <p className="text-xs font-semibold uppercase text-sea">Store editor</p>
          <h1 className="text-lg font-semibold">Редактор магазина</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-semibold text-mint md:inline">{autosaved}</span>
          <button onClick={undo} className="grid h-10 w-10 place-items-center rounded-md border border-line bg-white" title="Undo"><Undo2 size={17} /></button>
          <button onClick={redo} className="grid h-10 w-10 place-items-center rounded-md border border-line bg-white" title="Redo"><Redo2 size={17} /></button>
          <Tabs items={["Desktop", "Mobile"]} active={preview} onChange={setPreview} />
          <Button onClick={save}>Сохранить</Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-5 xl:grid-cols-[260px_1fr_320px]">
        <Card className="h-fit p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Блоки</h2>
            <Badge tone="blue">drag</Badge>
          </div>
          <div className="mt-4 space-y-2">
            {blocks.map((block) => (
              <button key={block} onClick={() => setActiveBlock(block)} className={`flex w-full items-center gap-3 rounded-md border p-3 text-left text-sm font-semibold transition hover:-translate-y-0.5 ${activeBlock === block ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>
                <GripVertical size={16} className={activeBlock === block ? "text-white/[0.6]" : "text-neutral-400"} />
                {block}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-line bg-paper p-3">
            <div className="flex items-center gap-2 text-sm font-semibold"><History size={16} />История</div>
            <div className="mt-3 space-y-2">
              {history.map((item) => <p key={item} className="rounded-md bg-white p-2 text-xs text-neutral-600">{item}</p>)}
            </div>
          </div>
        </Card>

        <section>
          <Card className="overflow-hidden p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <MonitorSmartphone size={18} className="text-sea" />
                <p className="text-sm font-semibold">Preview</p>
              </div>
              <div className="flex gap-2 text-xs text-neutral-500">
                <span className="flex items-center gap-1"><Laptop size={14} />Desktop</span>
                <span className="flex items-center gap-1"><Smartphone size={14} />Mobile</span>
              </div>
            </div>
            <div className={`mx-auto overflow-hidden rounded-lg border border-line transition-all duration-300 ${preview === "Mobile" ? "max-w-[390px]" : "max-w-full"}`} style={{ background: theme.bg, color: theme.text }}>
              <div className="relative min-h-[520px]">
                <img src={theme.image} alt="" className="h-64 w-full object-cover" />
                <div className="p-5">
                  <Badge tone="gold">{theme.title}</Badge>
                  <h2 className="mt-4 text-4xl font-semibold leading-tight">{settings.title}</h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 opacity-70">{theme.hero}</p>
                  <button className="mt-5 h-11 rounded-md px-4 text-sm font-semibold text-white" style={{ background: settings.color }}>{settings.button}</button>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {["Платок", "Парфюм", "Подарок"].map((item) => (
                      <div key={item} className="rounded-lg p-3" style={{ background: theme.surface }}>
                        <div className="aspect-square rounded-md" style={{ background: settings.color }} />
                        <p className="mt-2 text-sm font-semibold">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <Card className="h-fit p-4">
          <div className="flex items-center gap-2">
            <PanelRight size={18} className="text-berry" />
            <h2 className="text-sm font-semibold">Настройки</h2>
          </div>
          <div className="mt-4 space-y-3">
            <Field label="Заголовок hero" value={settings.title} onChange={(title) => updateSettings({ ...settings, title })} />
            <Field label="Текст кнопки" value={settings.button} onChange={(button) => updateSettings({ ...settings, button })} />
            <label className="block">
              <span className="text-xs font-semibold text-neutral-500">Акцент</span>
              <input type="color" value={settings.color} onChange={(event) => updateSettings({ ...settings, color: event.target.value })} className="mt-1 h-12 w-full rounded-md border border-line bg-white p-1" />
            </label>
            <div>
              <p className="text-xs font-semibold text-neutral-500">Быстрые стили</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {quickStyles.map((style) => <Badge key={style} tone="neutral">{style}</Badge>)}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-500">Темы</p>
              <div className="mt-2 grid gap-2">
                {storefrontThemes.map((item) => (
                  <button key={item.code} onClick={() => { setTheme(item); updateSettings({ ...settings, color: item.accent }); }} className={`rounded-md border p-3 text-left text-sm font-semibold ${theme.code === item.code ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>{item.title}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-neutral-500">AI действия</p>
              <AIActions compact />
            </div>
            <Button onClick={aiRedesign} variant="secondary" className="w-full"><Sparkles size={17} />Сделать магазин красивее с AI</Button>
            <Button variant="dark" className="w-full"><MessageCircle size={17} />CTA Telegram</Button>
          </div>
        </Card>
      </section>
    </main>
  );
}
