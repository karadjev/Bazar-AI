import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bazar AI — интернет-магазин за 5 минут",
  description: "AI создает красивую витрину, принимает заказы в Telegram и помогает продавать без программиста и дизайнера."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
