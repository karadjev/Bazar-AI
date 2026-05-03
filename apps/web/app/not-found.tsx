import Link from "next/link";
import { Footer, Header } from "@/components/ui-kit";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-paper text-ink" data-testid="page-not-found">
      <Header />
      <div className="shell flex flex-col items-center justify-center gap-6 py-24 text-center md:py-32">
        <p className="text-sm font-semibold tracking-wide text-neutral-500">404</p>
        <h1 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight md:text-5xl md:leading-[1.12]">Страница не найдена</h1>
        <p className="max-w-md text-sm leading-7 text-neutral-600 md:text-base md:leading-8">Проверьте адрес или вернитесь на главную и продолжите запуск витрины.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex h-11 items-center rounded-2xl bg-ink px-5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(13,17,23,0.2)] transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0">
            На главную
          </Link>
          <Link href="/onboarding" className="inline-flex h-11 items-center rounded-2xl border border-line bg-white px-5 text-sm font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50 active:translate-y-0">
            Создать магазин
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
