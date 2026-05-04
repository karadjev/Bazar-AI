import Link from "next/link";
import { Footer, Header } from "@/components/ui-kit";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-paper text-ink premium-grid" data-testid="page-not-found">
      <Header />
      <div className="shell flex flex-col items-center justify-center gap-6 py-24 text-center md:py-32">
        <span className="inline-flex items-center rounded-full border border-line/90 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-neutral-600 shadow-sm ring-1 ring-white/60 backdrop-blur-sm">
          404
        </span>
        <h1 className="max-w-lg text-3xl font-extrabold leading-tight tracking-tight md:text-5xl md:leading-[1.08]">
          Страница <span className="bg-gradient-to-r from-sea via-berry to-saffron bg-clip-text text-transparent">не найдена</span>
        </h1>
        <p className="max-w-md text-sm leading-7 text-neutral-600 md:text-base md:leading-8">Проверьте адрес или вернитесь на главную и продолжите запуск витрины.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-2xl bg-gradient-to-r from-ink via-ink to-sea px-6 text-sm font-semibold text-white shadow-[0_18px_44px_rgba(10,13,18,0.28)] transition duration-200 ease-premium hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
          >
            На главную
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex h-12 items-center rounded-2xl border border-line/90 bg-white/95 px-6 text-sm font-semibold shadow-[0_12px_30px_rgba(10,13,18,0.06)] transition duration-200 ease-premium hover:-translate-y-0.5 hover:border-sea/25 hover:bg-white active:translate-y-0"
          >
            Создать магазин
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
