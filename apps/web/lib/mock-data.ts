import { BadgeCheck, Bot, Boxes, ChartNoAxesCombined, ClipboardList, Palette, Send, Settings } from "lucide-react";

export const navItems = [
  { label: "Обзор", icon: ChartNoAxesCombined },
  { label: "Товары", icon: Boxes },
  { label: "Заказы", icon: ClipboardList },
  { label: "AI", icon: Bot },
  { label: "Дизайн", icon: Palette },
  { label: "Интеграции", icon: Send },
  { label: "Настройки", icon: Settings }
];

export const onboardingSteps = [
  { title: "Тип бизнеса", value: "Одежда и аксессуары", done: true },
  { title: "Название", value: "Kavkaz Style", done: true },
  { title: "Регион", value: "Ингушетия, Магас", done: true },
  { title: "Стиль", value: "Premium", done: true },
  { title: "Контакты", value: "Telegram + WhatsApp", done: false }
];

export const products = [
  {
    title: "Премиальный платок",
    category: "Аксессуары",
    price: "2 900 ₽",
    stock: 12,
    status: "Активен",
    image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Женский костюм",
    category: "Одежда",
    price: "7 400 ₽",
    stock: 5,
    status: "AI SEO готов",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Парфюм Oud",
    category: "Парфюм",
    price: "4 500 ₽",
    stock: 18,
    status: "В продаже",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80"
  }
];

export const orders = [
  { id: "BA-1042", name: "Амина", channel: "Telegram", total: "10 300 ₽", status: "Новый" },
  { id: "BA-1041", name: "Мадина", channel: "WhatsApp", total: "2 900 ₽", status: "Ожидает оплаты" },
  { id: "BA-1040", name: "Ислам", channel: "Сайт", total: "4 500 ₽", status: "Собирается" }
];

export const themes = ["Classic", "Premium", "Fashion", "Food", "Islamic", "Beauty", "Local Market"];

export const metrics = [
  { label: "Заказы сегодня", value: "18", hint: "+24%" },
  { label: "GMV", value: "126 700 ₽", hint: "за 7 дней" },
  { label: "AI генерации", value: "342", hint: "из 500" },
  { label: "Конверсия", value: "8.4%", hint: "мобайл" }
];

export const assurances = [
  "Публичная ссылка готова",
  "Telegram уведомления включены",
  "SEO тексты сгенерированы"
].map((label) => ({ label, icon: BadgeCheck }));
