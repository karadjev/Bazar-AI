import { ArrowUpRight, Loader2, PackageOpen, Sparkles } from "lucide-react";
import { money, Product } from "@/lib/api";

export function Button({
  children,
  variant = "primary",
  className = "",
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "dark"; loading?: boolean }) {
  const variants = {
    primary: "bg-berry text-white shadow-[0_14px_34px_rgba(154,54,95,0.22)] hover:bg-[#862c50]",
    secondary: "border border-line bg-white text-ink hover:border-neutral-300 hover:bg-neutral-50",
    ghost: "bg-transparent text-neutral-600 hover:bg-neutral-100",
    dark: "bg-ink text-white hover:bg-neutral-800"
  };
  const { style, ...buttonProps } = props;
  return (
    <button {...buttonProps} style={style} className={`focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 ${variants[variant]} ${className}`}>
      {loading && <Loader2 size={17} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Card({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return <div {...props} className={`rounded-lg border border-line bg-white shadow-soft ${className}`}>{children}</div>;
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "blue" | "gold" | "red" }) {
  const tones = {
    neutral: "bg-neutral-100 text-neutral-700",
    green: "bg-mint/12 text-mint",
    blue: "bg-sea/10 text-sea",
    gold: "bg-saffron/15 text-neutral-800",
    red: "bg-berry/10 text-berry"
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
        className="mt-1 h-12 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-sea focus:ring-4 focus:ring-sea/10"
      />
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-12 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-sea focus:ring-4 focus:ring-sea/10 ${props.className || ""}`}
    />
  );
}

export function Tabs({ items, active, onChange }: { items: string[]; active: string; onChange: (item: string) => void }) {
  return (
    <div className="inline-flex rounded-md border border-line bg-white p-1">
      {items.map((item) => (
        <button key={item} onClick={() => onChange(item)} className={`h-9 rounded px-3 text-sm font-semibold transition ${active === item ? "bg-ink text-white" : "text-neutral-500 hover:bg-neutral-100"}`}>
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
      <p className="font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Toast({ children }: { children: React.ReactNode }) {
  return <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white shadow-soft animate-rise">{children}</div>;
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
      <div className="w-full max-w-lg rounded-lg border border-line bg-white p-4 shadow-soft animate-rise">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md border border-line text-sm font-semibold">×</button>
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

export function ProductCard({ product, image, accent = "#101217" }: { product: Product; image?: string; accent?: string }) {
  return (
    <article className="overflow-hidden rounded-lg border border-line bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-premium">
      <div className="relative aspect-[4/3] bg-neutral-100">
        {image ? <img src={image} alt={product.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-neutral-400"><PackageOpen size={28} /></div>}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-base font-semibold">{product.title}</p>
          <span className="rounded-md px-2 py-1 text-xs font-semibold text-white" style={{ background: accent }}>AI</span>
        </div>
        <p className="mt-2 min-h-10 text-sm leading-5 text-neutral-500">{product.short_description || product.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-lg font-semibold">{money(product.price)}</span>
          <button className="grid h-9 w-9 place-items-center rounded-md bg-ink text-white" title="Открыть товар">
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

export function StorePreviewCard({ title, city, image, accent }: { title: string; city: string; image: string; accent: string }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-line bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-premium">
      <div className="relative aspect-[5/4] overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/72 via-ink/12 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-xs font-semibold" style={{ color: accent }}>{city}</p>
          <h3 className="mt-1 text-xl font-semibold">{title}</h3>
        </div>
      </div>
    </article>
  );
}
