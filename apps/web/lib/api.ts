export type Store = {
  id: string;
  name: string;
  slug: string;
  description: string;
  region: string;
  city: string;
  theme: string;
  contacts?: { phone?: string; whatsapp?: string; telegram?: string; instagram?: string };
};

export type Product = {
  id?: string;
  store_id?: string;
  title: string;
  slug?: string;
  description: string;
  short_description?: string;
  price: number;
  currency?: string;
  stock_quantity?: number;
  images?: string[];
};

export type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  total_amount: number;
  created_at?: string;
  items?: Array<{ product_id?: string; title: string; quantity: number; price: number; total?: number }>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const demoProducts: Product[] = [
  {
    id: "demo_1",
    title: "Премиальный платок",
    slug: "premium-platok",
    description: "Мягкий платок спокойного оттенка для повседневного и праздничного образа.",
    short_description: "Платок с мягкой посадкой.",
    price: 290000,
    currency: "RUB",
    stock_quantity: 12,
    images: ["https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80"]
  },
  {
    id: "demo_2",
    title: "Oud Classic 50ml",
    slug: "oud-classic-50",
    description: "Теплый восточный аромат в подарочной упаковке.",
    short_description: "Парфюм Oud.",
    price: 450000,
    currency: "RUB",
    stock_quantity: 14,
    images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80"]
  }
];

export const demoStore: Store = {
  id: "demo_store",
  name: "Kavkaz Style",
  slug: "kavkaz-style",
  description: "Одежда, аксессуары и подарки с быстрым заказом через Telegram или WhatsApp.",
  region: "Ингушетия",
  city: "Магас",
  theme: "premium",
  contacts: { phone: "+79000000000", whatsapp: "+79000000000", telegram: "@bazar_demo" }
};

export function money(value: number) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(value / 100);
}

export function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("bazar_access_token") || "";
}

export function setSession(accessToken: string, refreshToken: string) {
  localStorage.setItem("bazar_access_token", accessToken);
  localStorage.setItem("bazar_refresh_token", refreshToken);
}

export function clearSession() {
  localStorage.removeItem("bazar_access_token");
  localStorage.removeItem("bazar_refresh_token");
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "request failed" }));
    throw new Error(body.error || "request failed");
  }
  return response.json();
}

export async function registerDemo(email: string, password: string) {
  const result = await api<{ access_token: string; refresh_token: string }>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  setSession(result.access_token, result.refresh_token);
  return result;
}
