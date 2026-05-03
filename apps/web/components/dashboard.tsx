"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Bell, Bot, Check, ChevronRight, GripVertical, Moon, Plus, Search, Send, ShoppingBag, Sparkles, Sun } from "lucide-react";
import { assurances, metrics, navItems, onboardingSteps, orders, products, themes } from "@/lib/mock-data";

export function Dashboard() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[260px_1fr] lg:px-6">
        <aside className="hidden rounded-lg border border-line bg-white p-4 shadow-soft lg:block">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold">BuildYourStore.ai</p>
              <p className="text-xs text-neutral-500">Kavkaz Style</p>
            </div>
          </div>
          <nav className="mt-8 space-y-1">
            {navItems.map((item, index) => (
              <button
                key={item.label}
                className={`focus-ring flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${index === 0 ? "bg-ink text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
              >
                <item.icon size={17} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="space-y-4">
          <header className="flex items-center justify-between rounded-lg border border-line bg-white px-3 py-3 shadow-soft md:px-5">
            <div>
              <p className="text-xs font-medium uppercase text-sea">MVP dashboard</p>
              <h1 className="text-xl font-semibold md:text-2xl">Запуск магазина</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="focus-ring grid h-10 w-10 place-items-center rounded-md border border-line bg-white" title="Поиск">
                <Search size={18} />
              </button>
              <button className="focus-ring grid h-10 w-10 place-items-center rounded-md border border-line bg-white" title="Уведомления">
                <Bell size={18} />
              </button>
              <button className="focus-ring hidden h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white md:flex">
                <Plus size={17} />
                Товар
              </button>
            </div>
          </header>

          <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-lg border border-line bg-white shadow-soft"
            >
              <div className="grid gap-0 md:grid-cols-[1fr_280px]">
                <div className="p-5 md:p-7">
                  <p className="mb-3 inline-flex items-center gap-2 rounded-md bg-mint/10 px-3 py-1 text-xs font-semibold text-mint">
                    <Sparkles size={14} />
                    AI магазин почти готов
                  </p>
                  <h2 className="max-w-2xl text-3xl font-semibold leading-tight md:text-5xl">
                    Создай магазин за 5 минут и начни принимать заказы сегодня.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-600 md:text-base">
                    Онбординг собирает нишу, стиль, регион, товары, SEO и каналы связи в один запуск. Интерфейс рассчитан на работу с телефона.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <button className="focus-ring flex h-11 items-center gap-2 rounded-md bg-berry px-4 text-sm font-semibold text-white">
                      <Bot size={18} />
                      Сгенерировать магазин
                    </button>
                    <button className="focus-ring flex h-11 items-center gap-2 rounded-md border border-line px-4 text-sm font-semibold">
                      Открыть витрину
                      <ArrowUpRight size={17} />
                    </button>
                  </div>
                </div>
                <div className="relative min-h-[260px] bg-ink md:min-h-full">
                  <Image
                    src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=900&q=80"
                    alt="Предприниматель управляет онлайн-магазином"
                    fill
                    className="object-cover opacity-90"
                    priority
                  />
                </div>
              </div>
            </motion.div>

            <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Онбординг</h2>
                <span className="rounded-md bg-saffron/15 px-2 py-1 text-xs font-semibold text-neutral-800">4/5</span>
              </div>
              <div className="mt-4 space-y-3">
                {onboardingSteps.map((step) => (
                  <div key={step.title} className="flex items-center gap-3 rounded-md border border-line p-3">
                    <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${step.done ? "bg-mint text-white" : "bg-neutral-100 text-neutral-500"}`}>
                      {step.done ? <Check size={16} /> : <ChevronRight size={16} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="truncate text-xs text-neutral-500">{step.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-line bg-white p-4 shadow-soft">
                <p className="text-xs text-neutral-500">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
                <p className="mt-1 text-xs font-medium text-mint">{metric.hint}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Товары</h2>
                <button className="focus-ring grid h-9 w-9 place-items-center rounded-md border border-line" title="Добавить товар">
                  <Plus size={18} />
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {products.map((product) => (
                  <article key={product.title} className="overflow-hidden rounded-lg border border-line bg-paper">
                    <div className="relative aspect-[4/3]">
                      <Image src={product.image} alt={product.title} fill className="object-cover" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold">{product.title}</p>
                      <p className="text-xs text-neutral-500">{product.category}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold">{product.price}</span>
                        <span className="rounded-md bg-white px-2 py-1 text-xs">{product.stock} шт</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">CRM заказы</h2>
                <Send size={18} className="text-sea" />
              </div>
              <div className="mt-4 space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-lg border border-line p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{order.id}</p>
                      <span className="rounded-md bg-sea/10 px-2 py-1 text-xs font-semibold text-sea">{order.channel}</span>
                    </div>
                    <p className="mt-2 text-sm">{order.name}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                      <span>{order.status}</span>
                      <span className="font-semibold text-ink">{order.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
              <h2 className="text-base font-semibold">Редактор блоков</h2>
              <div className="mt-4 space-y-2">
                {["Hero banner", "Категории", "Популярные товары", "Отзывы", "Доставка", "Telegram блок"].map((block) => (
                  <div key={block} className="flex items-center gap-3 rounded-md border border-line p-3">
                    <GripVertical size={17} className="text-neutral-400" />
                    <span className="flex-1 text-sm font-medium">{block}</span>
                    <button className="h-6 w-11 rounded-full bg-mint p-1" title="Включить блок">
                      <span className="block h-4 w-4 translate-x-5 rounded-full bg-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Темы</h2>
                <div className="flex gap-1">
                  <button className="grid h-8 w-8 place-items-center rounded-md border border-line" title="Светлая тема"><Sun size={15} /></button>
                  <button className="grid h-8 w-8 place-items-center rounded-md border border-line bg-ink text-white" title="Темная тема"><Moon size={15} /></button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {themes.map((theme, index) => (
                  <button key={theme} className={`focus-ring rounded-md border p-3 text-left text-sm font-semibold ${index === 1 ? "border-berry bg-berry text-white" : "border-line bg-paper"}`}>
                    {theme}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid gap-2">
                {assurances.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm text-neutral-600">
                    <item.icon size={17} className="text-mint" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
