import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bazar AI — магазин за 5 минут",
  description: "Premium AI SaaS для запуска локальной витрины, Telegram/WhatsApp заказов и продаж с телефона."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
