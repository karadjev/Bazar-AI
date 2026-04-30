"use client";

import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { Toast } from "@/components/ui-kit";

const actions = ["Улучшить текст", "Сделать дороже", "Сделать по-кавказски", "Сделать более премиально", "Сократить", "Пост для Telegram"];

export function AIActions({ compact = false }: { compact?: boolean }) {
  const [toast, setToast] = useState("");

  function run(action: string) {
    setToast(`AI: ${action}`);
    setTimeout(() => setToast(""), 1800);
  }

  return (
    <div className={compact ? "flex gap-2 overflow-x-auto" : "grid gap-2 sm:grid-cols-2 lg:grid-cols-3"}>
      {toast && <Toast>{toast}</Toast>}
      {actions.map((action) => (
        <button key={action} onClick={() => run(action)} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-soft">
          {action.includes("Telegram") ? <Bot size={15} className="text-sea" /> : <Sparkles size={15} className="text-berry" />}
          {action}
        </button>
      ))}
    </div>
  );
}
