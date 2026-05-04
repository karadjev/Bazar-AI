import { ArrowUpRight, Loader2, PackageOpen, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { money, Product } from "@/lib/api";

type ButtonVariant = "primary" | "secondary" | "ghost" | "dark";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; loading?: boolean }) {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-berry text-white shadow-[0_14px_34px_rgba(139,50,88,0.22)] hover:bg-[#7a2a4c]",
    secondary: "border border-line/90 bg-white text-ink shadow-sm hover:border-sea/20 hover:bg-neutral-50",
    ghost: "bg-transparent text-neutral-600 hover:bg-neutral-100",
    dark: "bg-ink text-white shadow-[0_14px_34px_rgba(10,13,18,0.22)] hover:bg-neutral-800"
  };
  const sizes: Record<ButtonSize, string> = {
    sm: "h-9 rounded-xl px-3 text-xs",
    md: "h-11 rounded-xl px-4 text-sm",
    lg: "h-12 rounded-xl px-5 text-sm",
    icon: "h-11 w-11 rounded-xl p-0 text-sm"
  };
  const { style, ...buttonProps } = props;
  return (
    <button
      {...buttonProps}
      style={style}
      className={`focus-ring inline-flex shrink-0 items-center justify-center gap-2 font-semibold transition duration-200 ease-premium hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Loader2 size={17} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Card({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return (
    <div
      {...props}
      className={`rounded-2xl border border-line/90 bg-white/[0.97] shadow-[0_1px_0_rgba(255,255,255,0.92)_inset,0_2px_8px_rgba(10,13,18,0.03),0_24px_64px_rgba(10,13,18,0.07)] backdrop-blur-sm transition duration-200 ease-premium ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "blue" | "gold" | "red" | "dark" }) {
  const tones = {
    neutral: "border border-line/80 bg-white/90 text-neutral-700 shadow-sm",
    green: "border border-mint/20 bg-mint/[0.08] text-mint",
    blue: "border border-sea/25 bg-gradient-to-r from-sea/[0.08] to-berry/[0.06] text-sea shadow-sm",
    gold: "border border-saffron/25 bg-saffron/12 text-neutral-900",
    red: "border border-berry/20 bg-berry/[0.08] text-berry",
    dark: "border border-ink/10 bg-ink text-white shadow-md"
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em] ${tones[tone]}`}>{children}</span>
  );
}

export function Field({
  label,
  value,
  placeholder,
  onChange
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-neutral-500">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-12 w-full rounded-xl border border-line/90 bg-white px-3 text-sm outline-none transition duration-200 ease-premium placeholder:text-neutral-400 focus:border-sea focus:ring-4 focus:ring-sea/12"
      />
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-12 w-full rounded-xl border border-line/90 bg-white px-3 text-sm outline-none transition duration-200 ease-premium placeholder:text-neutral-400 focus:border-sea focus:ring-4 focus:ring-sea/12 ${props.className || ""}`}
    />
  );
}

export function Tabs({ items, active, onChange }: { items: string[]; active: string; onChange: (item: string) => void }) {
  return (
    <div className="inline-flex rounded-xl border border-line/90 bg-paper/90 p-1 shadow-inner">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`focus-ring h-9 rounded-lg px-3.5 text-sm font-semibold transition duration-200 ease-premium ${
            active === item ? "bg-gradient-to-r from-ink to-sea text-white shadow-md" : "text-neutral-500 hover:bg-white hover:text-ink hover:shadow-sm"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-neutral-200/90 ${className}`} />;
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line/90 bg-gradient-to-b from-white to-paper/80 p-8 text-center shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]">
      <p className="text-lg font-bold tracking-tight">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-neutral-600">{text}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function Toast({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 max-w-[min(420px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-white/10 bg-ink/95 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_24px_80px_rgba(10,13,18,0.35)] backdrop-blur-md animate-rise">
      {children}
    </div>
  );
}

export function Modal({
  title,
  open,
  children,
  onClose
}: {
  title: string;
  open: boolean;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-line/90 bg-white/98 p-5 shadow-[0_28px_90px_rgba(10,13,18,0.18)] ring-1 ring-black/[0.04] animate-rise">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sea via-berry to-saffron opacity-90" aria-hidden />
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring grid h-9 w-9 place-items-center rounded-xl border border-line/90 text-base font-semibold text-neutral-500 transition duration-200 ease-premium hover:bg-paper hover:text-ink"
          >
            ×
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export function Dropdown({ label, items }: { label: string; items: string[] }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-neutral-500">{label}</span>
      <select className="mt-1 h-11 w-full rounded-xl border border-line/90 bg-white px-3 text-sm outline-none transition duration-200 ease-premium focus:border-sea focus:ring-4 focus:ring-sea/12">
        {items.map((item) => <option key={item}>{item}</option>)}
      </select>
    </label>
  );
}

export function DataTable({ columns, rows }: { columns: string[]; rows: Array<Array<React.ReactNode>> }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line/90 bg-white/95 shadow-sm ring-1 ring-black/[0.03]">
      <table className="w-full text-left text-sm">
        <thead className="bg-paper text-xs text-neutral-500">
          <tr>{columns.map((column) => <th key={column} className="px-3 py-3 font-semibold">{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-line/90">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Stepper({ steps, active }: { steps: string[]; active: number }) {
  const pct = ((active + 1) / steps.length) * 100;
  return (
    <div className="space-y-3">
      <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100/90 shadow-inner ring-1 ring-black/[0.04]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sea via-berry to-saffron transition-all duration-500 ease-premium shadow-[0_0_20px_rgba(29,111,130,0.35)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`rounded-xl px-1.5 py-2 text-center text-[10px] font-bold uppercase leading-tight tracking-wide sm:text-[11px] ${
              index === active
                ? "bg-gradient-to-br from-ink to-sea text-white shadow-md ring-1 ring-white/15"
                : index < active
                  ? "border border-mint/25 bg-mint/10 text-neutral-800"
                  : "border border-line/80 bg-white/90 text-neutral-500"
            }`}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MetricCard({ label, value, hint, icon }: { label: string; value: string; hint: string; icon?: React.ReactNode }) {
  return (
    <Card className="group relative overflow-hidden p-5 transition duration-200 ease-premium hover:-translate-y-1 hover:border-sea/20 hover:shadow-premium">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sea/10 blur-2xl transition group-hover:bg-sea/15" aria-hidden />
      <div className="relative flex items-center justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-sea/15 to-berry/10 text-sea ring-1 ring-sea/15">{icon || <Sparkles size={18} />}</div>
        <span className="rounded-full border border-mint/20 bg-mint/10 px-2.5 py-1 text-[11px] font-bold text-mint">{hint}</span>
      </div>
      <p className="relative mt-4 text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-500">{label}</p>
      <p className="relative mt-1 text-2xl font-extrabold tracking-tight">{value}</p>
    </Card>
  );
}

export function ProductCard({ product, image, accent = "#0D1117" }: { product: Product; image?: string; accent?: string }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-line/90 bg-white/95 shadow-soft ring-1 ring-black/[0.03] transition duration-200 ease-premium hover:-translate-y-1 hover:border-sea/15 hover:shadow-premium">
      <div className="relative aspect-[4/3] bg-neutral-100">
        {image ? <Image src={image} alt={product.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" /> : <div className="grid h-full place-items-center text-neutral-400"><PackageOpen size={28} /></div>}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-base font-bold">{product.title}</p>
          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm" style={{ background: accent }}>AI</span>
        </div>
        <p className="mt-2 min-h-10 text-sm leading-5 text-neutral-500">{product.short_description || product.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-lg font-extrabold">{money(product.price)}</span>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-white shadow-md" title="Карточка товара">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </article>
  );
}

export function StorePreviewCard({
  title,
  city,
  image,
  accent,
  href
}: {
  title: string;
  city: string;
  image: string;
  accent: string;
  href?: string;
}) {
  const to = href || "/templates";
  return (
    <Link
      href={to}
      className="group block overflow-hidden rounded-2xl border border-line/90 bg-white shadow-soft ring-0 transition duration-200 ease-premium hover:-translate-y-1 hover:border-sea/25 hover:shadow-premium hover:ring-2 hover:ring-sea/15"
    >
      <div className="relative aspect-[5/4] overflow-hidden">
        <Image src={image} alt={title} fill className="object-cover transition duration-500 ease-premium group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 420px" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/72 via-ink/12 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-xs font-semibold" style={{ color: accent }}>{city}</p>
          <h3 className="mt-1 text-xl font-semibold">{title}</h3>
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white/90">
            Открыть в мастере <ArrowUpRight size={14} aria-hidden="true" />
          </p>
        </div>
      </div>
    </Link>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  text,
  children,
  className = ""
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  text?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`shell animate-reveal py-16 md:py-24 [content-visibility:auto] [contain-intrinsic-size:1px_900px] ${className}`}
    >
      {(eyebrow || title || text) && (
        <div className="mb-10 md:mb-12">
          {eyebrow && <Badge tone="blue">{eyebrow}</Badge>}
          {title && (
            <h2 className="mt-5 max-w-3xl text-3xl font-extrabold leading-[1.12] tracking-tight text-balance md:text-5xl md:leading-[1.08]">
              {title}
            </h2>
          )}
          {text && <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 md:text-base md:leading-8">{text}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Header() {
  return (
    <header className="relative sticky top-0 z-40 border-b border-line/50 bg-white/[0.72] shadow-[0_12px_48px_rgba(10,13,18,0.05),0_1px_0_rgba(255,255,255,0.85)_inset] backdrop-blur-2xl backdrop-saturate-[1.35]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sea/25 to-transparent"
        aria-hidden
      />
      <div className="shell flex h-16 items-center justify-between gap-3">
        <Link href="/" className="group flex min-w-0 items-center gap-3 rounded-2xl outline-none ring-ink/0 transition duration-200 ease-premium hover:ring-2 hover:ring-sea/15 focus-visible:ring-2 focus-visible:ring-sea/40">
          <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-sea via-ink to-berry text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(29,111,130,0.35)] ring-1 ring-white/25">
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" aria-hidden />
            BS
          </span>
          <span className="truncate bg-gradient-to-r from-ink to-neutral-600 bg-clip-text text-sm font-bold text-transparent">BuildYourStore.ai</span>
        </Link>
        <nav aria-label="Основная навигация" className="hidden items-center gap-0.5 rounded-2xl border border-line/80 bg-paper/80 p-1 text-sm font-semibold text-neutral-600 shadow-inner lg:flex">
          {[
            ["/features", "Возможности"],
            ["/pricing", "Тарифы"],
            ["/templates", "Шаблоны"],
            ["/editor", "Редактор"],
            ["/dashboard", "Кабинет"]
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl px-3 py-2 transition-colors duration-200 ease-premium hover:bg-white hover:text-ink hover:shadow-sm"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/store/oud-house"
            className="hidden h-10 items-center rounded-2xl border border-line/90 bg-white/90 px-3.5 text-sm font-semibold text-neutral-700 shadow-sm transition duration-200 ease-premium hover:-translate-y-px hover:border-neutral-300 hover:bg-white sm:inline-flex"
          >
            Демо
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex h-10 items-center rounded-2xl bg-gradient-to-r from-ink via-ink to-sea px-4 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(10,13,18,0.22)] transition duration-200 ease-premium hover:-translate-y-px hover:brightness-110"
          >
            Создать магазин
          </Link>
        </div>
      </div>
      <div aria-label="Мобильная навигация" className="shell mb-2 flex gap-2 overflow-x-auto pb-1 lg:hidden" role="navigation">
        {[
          ["/features", "Возможности"],
          ["/pricing", "Тарифы"],
          ["/templates", "Шаблоны"],
          ["/editor", "Редактор"],
          ["/dashboard", "Кабинет"]
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="inline-flex h-8 shrink-0 items-center rounded-xl border border-line/90 bg-white/95 px-3 text-xs font-semibold text-neutral-600 shadow-sm transition duration-200 ease-premium hover:border-neutral-300 hover:bg-white"
          >
            {label}
          </Link>
        ))}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-line/80 bg-gradient-to-b from-white to-paper">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sea/35 to-transparent"
        aria-hidden
      />
      <div className="shell flex flex-col gap-8 py-12 text-sm text-neutral-600 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="bg-gradient-to-r from-ink to-neutral-600 bg-clip-text text-lg font-extrabold text-transparent">BuildYourStore.ai</p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-neutral-600">Витрина, заявки и кабинет для локального бизнеса. Запуск за минуты.</p>
          <Link
            href="/onboarding"
            className="mt-5 inline-flex h-11 items-center rounded-2xl bg-gradient-to-r from-ink to-sea px-5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(10,13,18,0.2)] transition duration-200 ease-premium hover:-translate-y-px hover:brightness-110"
          >
            Создать магазин
          </Link>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase text-neutral-500">Продукт</p>
            <Link href="/features" className="rounded-lg py-0.5 transition-colors duration-200 ease-premium hover:text-ink">Возможности</Link>
            <Link href="/pricing" className="rounded-lg py-0.5 transition-colors duration-200 ease-premium hover:text-ink">Тарифы</Link>
            <Link href="/templates" className="rounded-lg py-0.5 transition-colors duration-200 ease-premium hover:text-ink">Шаблоны</Link>
          </div>
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase text-neutral-500">Рабочие зоны</p>
            <Link href="/onboarding" className="rounded-lg py-0.5 transition-colors duration-200 ease-premium hover:text-ink">Мастер запуска</Link>
            <Link href="/dashboard" className="rounded-lg py-0.5 transition-colors duration-200 ease-premium hover:text-ink">Кабинет</Link>
            <Link href="/editor" className="rounded-lg py-0.5 transition-colors duration-200 ease-premium hover:text-ink">Редактор витрины</Link>
            <Link href="/store/oud-house" className="rounded-lg py-0.5 transition-colors duration-200 ease-premium hover:text-ink">Демо-магазин</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl p-6 hover:-translate-y-1 hover:border-sea/25 hover:shadow-premium">
      <span
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sea via-berry to-saffron opacity-80 transition duration-200 ease-premium group-hover:opacity-100"
        aria-hidden
      />
      <p className="text-lg font-bold tracking-tight">{title}</p>
      <p className="mt-3 text-sm leading-7 text-neutral-600">{text}</p>
    </Card>
  );
}

export function StepCard({ index, title, text }: { index: number; title: string; text: string }) {
  return (
    <Card className="relative overflow-hidden rounded-2xl p-6 hover:-translate-y-1 hover:border-sea/20 hover:shadow-premium">
      <div className="flex gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sea/15 to-berry/10 text-base font-extrabold text-sea ring-1 ring-sea/20">
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-500">Шаг {index}</p>
          <p className="mt-2 text-lg font-bold tracking-tight">{title}</p>
          <p className="mt-2 text-sm leading-7 text-neutral-600">{text}</p>
        </div>
      </div>
    </Card>
  );
}

export function PricingCard({
  name,
  price,
  text,
  featured,
  href
}: {
  name: string;
  price: string;
  text: string;
  featured?: boolean;
  href?: string;
}) {
  const to = href || "/onboarding";
  return (
    <Card
      className={`rounded-2xl p-7 transition duration-200 ease-premium hover:-translate-y-1 hover:shadow-premium ${
        featured
          ? "relative overflow-hidden border-sea/30 bg-gradient-to-br from-ink via-[#121826] to-sea text-white shadow-[0_28px_70px_rgba(10,13,18,0.35)] ring-1 ring-white/10"
          : "hover:border-neutral-200"
      }`}
    >
      {featured && (
        <span
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sea/25 blur-3xl"
          aria-hidden
        />
      )}
      <p className={`text-lg font-bold tracking-tight ${featured ? "relative" : ""}`}>{name}</p>
      <p className={`mt-5 text-4xl font-extrabold tracking-tight ${featured ? "relative" : ""}`}>{price}</p>
      <p className={`mt-3 text-sm leading-7 ${featured ? "relative text-white/75" : "text-neutral-600"}`}>{text}</p>
      <Link
        href={to}
        className={`relative mt-7 inline-flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold transition duration-200 ease-premium hover:-translate-y-0.5 active:translate-y-0 ${
          featured
            ? "bg-white text-ink shadow-[0_16px_40px_rgba(0,0,0,0.2)] hover:bg-neutral-100"
            : "bg-gradient-to-r from-ink to-sea text-white shadow-[0_14px_34px_rgba(10,13,18,0.18)] hover:brightness-110"
        }`}
      >
        Запустить
      </Link>
    </Card>
  );
}
