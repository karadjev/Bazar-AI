export type Store = {
  id: string;
  owner_id?: string;
  name: string;
  slug: string;
  niche?: string;
  description: string;
  region: string;
  city: string;
  theme: string;
  style?: string;
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
  image?: string;
  featured?: boolean;
};

export type Lead = {
  id: string;
  store_id: string;
  customer_name: string;
  phone: string;
  message: string;
  status: string;
  created_at?: string;
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

export type AuthUser = {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  role: string;
  status: string;
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
    const body = await response.json().catch(() => null) as
      | { error?: string | { message?: string; code?: string } }
      | null;
    if (typeof body?.error === "string") {
      throw new Error(body.error);
    }
    if (body?.error && typeof body.error === "object" && body.error.message) {
      throw new Error(body.error.message);
    }
    throw new Error("request failed");
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

export async function loginDemo(email: string, password: string) {
  const result = await api<{ access_token: string; refresh_token: string }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  setSession(result.access_token, result.refresh_token);
  return result;
}

export async function authMe() {
  return api<{ user: AuthUser }>("/api/v1/auth/me");
}

export async function createStoreOnboarding(input: {
  name: string;
  niche: string;
  city: string;
  region: string;
  style: string;
  contacts: { phone?: string; whatsapp?: string; telegram?: string };
}) {
  const token = getToken();
  const guest = !token ? "?guest=1" : "";
  return api<{ store: Store; guest_mode?: boolean }>(`/api/onboarding/create-store${guest}`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function dashboardStores() {
  const token = getToken();
  const guest = !token ? "?guest=1" : "";
  return api<{ data: Store[] }>(`/api/dashboard/stores${guest}`);
}

export async function dashboardLeads() {
  const token = getToken();
  const guest = !token ? "?guest=1" : "";
  return api<{ data: Lead[] }>(`/api/dashboard/leads${guest}`);
}

export async function dashboardAnalytics() {
  const token = getToken();
  const guest = !token ? "?guest=1" : "";
  return api<{ data: { stores: number; leads: number; orders: number; gmv: number } }>(`/api/dashboard/analytics${guest}`);
}

export async function publicStore(slug: string) {
  return api<{ store: Store; products: Product[] }>(`/api/store/${slug}`);
}

export async function createLead(slug: string, payload: { customerName: string; phone: string; message: string }) {
  return api<Lead>(`/api/store/${slug}/lead`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateProduct(productId: string, payload: {
  title: string;
  description: string;
  short_description?: string;
  price: number;
  currency?: string;
  stock_quantity?: number;
  status?: string;
  image?: string;
  featured?: boolean;
}) {
  return api<Product>(`/api/v1/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function deleteProduct(productId: string) {
  return api<{ status: string }>(`/api/v1/products/${productId}`, { method: "DELETE" });
}
