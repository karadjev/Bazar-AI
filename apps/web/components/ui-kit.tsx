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
    primary: "bg-berry text-white shadow-[0_14px_34px_rgba(146,56,95,0.22)] hover:bg-[#7f2f52]",
    secondary: "border border-line bg-white text-ink shadow-sm hover:border-neutral-300 hover:bg-neutral-50",
    ghost: "bg-transparent text-neutral-600 hover:bg-neutral-100",
    dark: "bg-ink text-white shadow-[0_14px_34px_rgba(13,17,23,0.22)] hover:bg-neutral-800"
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
      className={`focus-ring inline-flex shrink-0 items-center justify-center gap-2 font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Loader2 size={17} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Card({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return <div {...props} className={`rounded-2xl border border-line bg-white shadow-soft transition duration-200 ${className}`}>{children}</div>;
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "blue" | "gold" | "red" | "dark" }) {
  const tones = {
    neutral: "bg-neutral-100 text-neutral-700",
    green: "bg-mint/12 text-mint",
    blue: "bg-sea/10 text-sea",
    gold: "bg-saffron/15 text-neutral-900",
    red: "bg-berry/10 text-berry",
    dark: "bg-ink text-white"
  };
  return <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
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
        className="mt-1 h-12 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-sea focus:ring-4 focus:ring-sea/10"
      />
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-12 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-sea focus:ring-4 focus:ring-sea/10 ${props.className || ""}`}
    />
  );
}

export function Tabs({ items, active, onChange }: { items: string[]; active: string; onChange: (item: string) => void }) {
  return (
    <div className="inline-flex rounded-md border border-line bg-white p-1 shadow-sm">
      {items.map((item) => (
        <button key={item} type="button" onClick={() => onChange(item)} className={`focus-ring h-9 rounded-lg px-3 text-sm font-semibold transition duration-200 ${active === item ? "bg-ink text-white" : "text-neutral-500 hover:bg-neutral-100"}`}>
          {item}
        </button>
      ))}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-200 ${className}`} />;
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-paper p-6 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Toast({ children }: { children: React.ReactNode }) {
  return <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white shadow-premium animate-rise">{children}</div>;
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-line bg-white p-4 shadow-premium animate-rise">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="focus-ring grid h-8 w-8 place-items-center rounded-lg border border-line text-sm font-semibold transition hover:bg-neutral-50">×</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function Dropdown({ label, items }: { label: string; items: string[] }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-neutral-500">{label}</span>
      <select className="mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-sea">
        {items.map((item) => <option key={item}>{item}</option>)}
      </select>
    </label>
  );
}

export function DataTable({ columns, rows }: { columns: string[]; rows: Array<Array<React.ReactNode>> }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-paper text-xs text-neutral-500">
          <tr>{columns.map((column) => <th key={column} className="px-3 py-3 font-semibold">{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-line">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Stepper({ steps, active }: { steps: string[]; active: number }) {
  return (
    <div className="space-y-3">
      <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-ink transition-all duration-500" style={{ width: `${((active + 1) / steps.length) * 100}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {steps.map((step, index) => (
          <div key={step} className={`rounded-md px-2 py-2 text-center text-xs font-semibold ${index <= active ? "bg-ink text-white" : "bg-white text-neutral-500"}`}>
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MetricCard({ label, value, hint, icon }: { label: string; value: string; hint: string; icon?: React.ReactNode }) {
  return (
    <Card className="p-4 transition hover:-translate-y-0.5 hover:shadow-premium">
      <div className="flex items-center justify-between gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-sea/10 text-sea">{icon || <Sparkles size={18} />}</div>
        <span className="rounded-md bg-mint/10 px-2 py-1 text-xs font-semibold text-mint">{hint}</span>
      </div>
      <p className="mt-4 text-xs font-semibold text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </Card>
  );
}

export function ProductCard({ product, image, accent = "#0D1117" }: { product: Product; image?: string; accent?: string }) {
  return (
    <article className="overflow-hidden rounded-lg border border-line bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-premium">
      <div className="relative aspect-[4/3] bg-neutral-100">
        {image ? <Image src={image} alt={product.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" /> : <div className="grid h-full place-items-center text-neutral-400"><PackageOpen size={28} /></div>}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-base font-semibold">{product.title}</p>
          <span className="rounded-md px-2 py-1 text-xs font-semibold text-white" style={{ background: accent }}>AI</span>
        </div>
        <p className="mt-2 min-h-10 text-sm leading-5 text-neutral-500">{product.short_description || product.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-lg font-semibold">{money(product.price)}</span>
          <span className="grid h-9 w-9 place-items-center rounded-md bg-ink text-white" title="Карточка товара">
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
    <Link href={to} className="group block overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition duration-200 hover:-translate-y-1 hover:border-neutral-200 hover:shadow-premium">
      <div className="relative aspect-[5/4] overflow-hidden">
        <Image src={image} alt={title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 420px" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/72 via-ink/12 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-xs font-semibold" style={{ color: accent }}>{city}</p>
          <h3 className="mt-1 text-xl font-semibold">{title}</h3>
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white/90">
            Открыть в мастере <ArrowUpRight size={14} />
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
    <section id={id} className={`shell animate-reveal py-16 md:py-24 ${className}`}>
      {(eyebrow || title || text) && (
        <div className="mb-10 md:mb-12">
          {eyebrow && <Badge tone="blue">{eyebrow}</Badge>}
          {title && <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-[1.15] tracking-tight text-balance md:text-5xl md:leading-[1.12]">{title}</h2>}
          {text && <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 md:text-base md:leading-8">{text}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-ink text-sm font-semibold text-white">BS</span>
          <span className="truncate text-sm font-semibold">BuildYourStore.ai</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm font-medium text-neutral-600 lg:flex">
          {[
            ["/features", "Возможности"],
            ["/pricing", "Тарифы"],
            ["/templates", "Шаблоны"],
            ["/editor", "Редактор"],
            ["/dashboard", "Кабинет"]
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-lg px-2.5 py-1.5 transition-colors duration-200 hover:bg-neutral-100 hover:text-ink">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/store/oud-house" className="hidden h-10 items-center rounded-2xl border border-line bg-white px-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 sm:inline-flex">
            Демо
          </Link>
          <Link href="/onboarding" className="inline-flex h-10 items-center rounded-2xl bg-ink px-4 text-sm font-semibold text-white transition hover:bg-neutral-800">
            Создать магазин
          </Link>
        </div>
      </div>
      <div className="shell mb-2 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {[
          ["/features", "Возможности"],
          ["/pricing", "Тарифы"],
          ["/templates", "Шаблоны"],
          ["/editor", "Редактор"],
          ["/dashboard", "Кабинет"]
        ].map(([href, label]) => (
          <Link key={href} href={href} className="inline-flex h-8 shrink-0 items-center rounded-xl border border-line bg-white px-3 text-xs font-semibold text-neutral-600 transition duration-200 hover:border-neutral-300 hover:bg-neutral-50">
            {label}
          </Link>
        ))}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="shell flex flex-col gap-4 py-10 text-sm text-neutral-600 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-semibold text-ink">BuildYourStore.ai</p>
          <p className="mt-2 max-w-xs text-sm leading-6">Витрина, заявки и кабинет для локального бизнеса. Запуск за минуты.</p>
          <Link href="/onboarding" className="mt-4 inline-flex h-10 items-center rounded-2xl bg-ink px-4 text-sm font-semibold text-white transition hover:bg-neutral-800">
            Создать магазин
          </Link>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase text-neutral-500">Продукт</p>
            <Link href="/features" className="rounded-md py-0.5 transition-colors duration-200 hover:text-ink">Возможности</Link>
            <Link href="/pricing" className="rounded-md py-0.5 transition-colors duration-200 hover:text-ink">Тарифы</Link>
            <Link href="/templates" className="rounded-md py-0.5 transition-colors duration-200 hover:text-ink">Шаблоны</Link>
          </div>
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase text-neutral-500">Рабочие зоны</p>
            <Link href="/onboarding" className="rounded-md py-0.5 transition-colors duration-200 hover:text-ink">Мастер запуска</Link>
            <Link href="/dashboard" className="rounded-md py-0.5 transition-colors duration-200 hover:text-ink">Кабинет</Link>
            <Link href="/editor" className="rounded-md py-0.5 transition-colors duration-200 hover:text-ink">Редактор витрины</Link>
            <Link href="/store/oud-house" className="rounded-md py-0.5 transition-colors duration-200 hover:text-ink">Демо-магазин</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <Card className="rounded-2xl p-5 hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-premium">
      <p className="text-lg font-semibold tracking-tight">{title}</p>
      <p className="mt-3 text-sm leading-6 text-neutral-600">{text}</p>
    </Card>
  );
}

export function StepCard({ index, title, text }: { index: number; title: string; text: string }) {
  return (
    <Card className="rounded-2xl p-5 hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-premium">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Шаг {index}</p>
      <p className="mt-3 text-lg font-semibold tracking-tight">{title}</p>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{text}</p>
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
    <Card className={`rounded-2xl p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-premium ${featured ? "border-ink bg-ink text-white shadow-[0_20px_60px_rgba(13,17,23,0.25)]" : "hover:border-neutral-200"}`}>
      <p className="text-lg font-semibold tracking-tight">{name}</p>
      <p className="mt-4 text-4xl font-semibold tracking-tight">{price}</p>
      <p className={`mt-3 text-sm leading-6 ${featured ? "text-white/70" : "text-neutral-600"}`}>{text}</p>
      <Link href={to} className={`mt-6 inline-flex h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 ${featured ? "bg-white text-ink shadow-soft hover:bg-neutral-100" : "bg-ink text-white shadow-soft hover:bg-neutral-800"}`}>
        Запустить
      </Link>
    </Card>
  );
}
