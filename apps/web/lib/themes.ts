export type StoreTheme = {
  code: string;
  title: string;
  category: string;
  hero: string;
  tagline: string;
  accent: string;
  secondary: string;
  bg: string;
  surface: string;
  text: string;
  image: string;
  productImage: string;
  mood: string;
  font: string;
  iconSet: string[];
  structure: string[];
  copy: string[];
  cardStyle: string;
};

export const storefrontThemes: StoreTheme[] = [
  {
    code: "premium-fashion",
    title: "Modest Fashion",
    category: "Женская одежда",
    hero: "Большой fashion hero, мягкие карточки, editorial-композиция.",
    tagline: "Коллекция, которую удобно заказать сегодня",
    accent: "#9A365F",
    secondary: "#E7A83E",
    bg: "#FAFAF7",
    surface: "#FFFFFF",
    text: "#141414",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=80",
    productImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    mood: "Editorial",
    font: "Inter / Display",
    iconSet: ["sparkle", "hanger", "delivery"],
    structure: ["hero", "new collection", "products", "reviews", "delivery", "telegram CTA"],
    copy: ["Новая коллекция", "Подберем размер", "Доставка по городу"],
    cardStyle: "large image, quiet metadata"
  },
  {
    code: "beauty",
    title: "Beauty",
    category: "Косметика",
    hero: "Чистый beauty-ритейл, свет, воздух, аккуратные детали.",
    tagline: "Уход, который легко выбрать и заказать",
    accent: "#277C8E",
    secondary: "#F0C7D7",
    bg: "#F7FBFA",
    surface: "#FFFFFF",
    text: "#102326",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=80",
    productImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
    mood: "Clean",
    font: "Inter / Soft",
    iconSet: ["drop", "shine", "skin"],
    structure: ["hero", "bestsellers", "skin routine", "products", "FAQ", "contacts"],
    copy: ["Бережный уход", "Подбор по типу кожи", "Подарочные наборы"],
    cardStyle: "clean product lab cards"
  },
  {
    code: "halal-market",
    title: "Halal Market",
    category: "Халяль-продукты",
    hero: "Практичный grocery layout, быстрый заказ, доверие к доставке.",
    tagline: "Свежие продукты с понятной доставкой",
    accent: "#5BA97D",
    secondary: "#E7A83E",
    bg: "#F8FAF4",
    surface: "#FFFFFF",
    text: "#17311F",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80",
    productImage: "https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=900&q=80",
    mood: "Fresh",
    font: "Inter / Utility",
    iconSet: ["basket", "halal", "clock"],
    structure: ["hero", "categories", "daily boxes", "products", "delivery", "WhatsApp order"],
    copy: ["Халяль", "Доставка сегодня", "Семейные наборы"],
    cardStyle: "market shelf cards"
  },
  {
    code: "perfume-luxury",
    title: "Luxury Perfume",
    category: "Парфюм",
    hero: "Темная luxury-витрина с сильным фокусом на продукт.",
    tagline: "Ароматы, которые выглядят как подарок",
    accent: "#E7A83E",
    secondary: "#9A365F",
    bg: "#111111",
    surface: "#1C1A18",
    text: "#FFF8ED",
    image: "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1400&q=80",
    productImage: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80",
    mood: "Luxury",
    font: "Serif mood / Inter",
    iconSet: ["bottle", "gift", "oud"],
    structure: ["immersive hero", "signature scents", "products", "gift sets", "reviews", "private order"],
    copy: ["Oud collection", "Подарочная упаковка", "Подберем аромат"],
    cardStyle: "dark luxury cards"
  },
  {
    code: "cakes-food",
    title: "Cakes & Food",
    category: "Торты",
    hero: "Аппетитная витрина с крупными фото и быстрым checkout.",
    tagline: "Торты и десерты к вашему событию",
    accent: "#C46A4A",
    secondary: "#E7A83E",
    bg: "#FFF8F2",
    surface: "#FFFFFF",
    text: "#2B1810",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1400&q=80",
    productImage: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80",
    mood: "Warm",
    font: "Rounded / Inter",
    iconSet: ["cake", "calendar", "delivery"],
    structure: ["hero", "occasion categories", "cakes", "custom order", "delivery", "contacts"],
    copy: ["На заказ", "Свежая выпечка", "Для семейных событий"],
    cardStyle: "warm bakery cards"
  },
  {
    code: "islamic-store",
    title: "Islamic Goods",
    category: "Исламские товары",
    hero: "Спокойная, уважительная витрина для книг, подарков и товаров.",
    tagline: "Книги, подарки и товары с уважительной подачей",
    accent: "#277C8E",
    secondary: "#5BA97D",
    bg: "#F8F7F2",
    surface: "#FFFFFF",
    text: "#172326",
    image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1400&q=80",
    productImage: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=900&q=80",
    mood: "Calm",
    font: "Calm / Inter",
    iconSet: ["book", "gift", "moon"],
    structure: ["hero", "categories", "books", "gift boxes", "FAQ", "telegram CTA"],
    copy: ["Подарочные наборы", "Книги", "Аккуратная доставка"],
    cardStyle: "calm framed cards"
  },
  {
    code: "electronics",
    title: "Electronics",
    category: "Техника",
    hero: "Плотная витрина техники с акцентом на характеристики и наличие.",
    tagline: "Техника в наличии, заказ за минуту",
    accent: "#5165F6",
    secondary: "#111827",
    bg: "#F5F7FB",
    surface: "#FFFFFF",
    text: "#111827",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    productImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    mood: "Tech",
    font: "Inter / Mono accents",
    iconSet: ["chip", "warranty", "stock"],
    structure: ["hero", "categories", "spec cards", "products", "warranty", "checkout"],
    copy: ["В наличии", "Гарантия", "Быстрый заказ"],
    cardStyle: "spec-first cards"
  },
  {
    code: "local-brand",
    title: "Local Brand",
    category: "Локальный бренд",
    hero: "Современная локальная витрина с фокусом на доверие и близость.",
    tagline: "Локальный бренд, который выглядит федерально",
    accent: "#E7A83E",
    secondary: "#277C8E",
    bg: "#F7F5EE",
    surface: "#FFFFFF",
    text: "#1F211D",
    image: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1400&q=80",
    productImage: "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80",
    mood: "Local",
    font: "Inter / Brand",
    iconSet: ["pin", "chat", "delivery"],
    structure: ["hero", "story", "popular products", "reviews", "delivery", "social CTA"],
    copy: ["Локально", "Быстрая связь", "Доставка рядом"],
    cardStyle: "brand story cards"
  },
  {
    code: "auto-parts",
    title: "Auto Parts",
    category: "Автотовары",
    hero: "Функциональная витрина автотоваров с быстрым подбором и звонком.",
    tagline: "Запчасти и аксессуары без долгих переписок",
    accent: "#D94C32",
    secondary: "#111827",
    bg: "#F4F5F7",
    surface: "#FFFFFF",
    text: "#111827",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1400&q=80",
    productImage: "https://images.unsplash.com/photo-1600661653561-629509216228?auto=format&fit=crop&w=900&q=80",
    mood: "Utility",
    font: "Inter / Compact",
    iconSet: ["car", "tools", "call"],
    structure: ["search hero", "categories", "availability", "products", "call CTA"],
    copy: ["Подбор по авто", "В наличии", "Звонок продавцу"],
    cardStyle: "compact availability cards"
  },
  {
    code: "beauty-salon",
    title: "Beauty Salon",
    category: "Услуги красоты",
    hero: "Витрина услуг с записью, портфолио и быстрым контактом.",
    tagline: "Запись на услуги через один экран",
    accent: "#B85C82",
    secondary: "#277C8E",
    bg: "#FFF7FB",
    surface: "#FFFFFF",
    text: "#23121A",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=80",
    productImage: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80",
    mood: "Soft service",
    font: "Inter / Soft",
    iconSet: ["calendar", "portfolio", "chat"],
    structure: ["hero", "services", "portfolio", "masters", "reviews", "booking CTA"],
    copy: ["Запись сегодня", "Портфолио", "Отзывы клиентов"],
    cardStyle: "service booking cards"
  },
  {
    code: "premium-boutique",
    title: "Premium Boutique",
    category: "Бутик",
    hero: "Бутик-витрина с дорогой подачей, крупными фото и подбором.",
    tagline: "Премиальный ассортимент с персональным подбором",
    accent: "#141414",
    secondary: "#E7A83E",
    bg: "#F5F2EA",
    surface: "#FFFFFF",
    text: "#141414",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80",
    productImage: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
    mood: "Boutique",
    font: "Editorial / Inter",
    iconSet: ["diamond", "stylist", "delivery"],
    structure: ["hero", "curated picks", "products", "stylist CTA", "reviews"],
    copy: ["Подбор образа", "Премиум", "Доставка"],
    cardStyle: "boutique editorial cards"
  }
];

/** Демо-URL `/store/:slug` для превью по коду темы (согласовано с themeBySlug). */
export function demoSlugForThemeCode(code: string): string {
  const slugs: Record<string, string> = {
    "premium-fashion": "amina-wear",
    beauty: "beauty-cosmetics",
    "halal-market": "halal-basket",
    "perfume-luxury": "oud-house",
    "cakes-food": "cake-atelier",
    "islamic-store": "iman-store",
    electronics: "electronics-demo",
    "local-brand": "local-brand-demo",
    "auto-parts": "auto-parts-demo",
    "beauty-salon": "beauty-salon-demo",
    "premium-boutique": "premium-boutique-demo"
  };
  return slugs[code] || "oud-house";
}

export function themeBySlug(slug: string) {
  const s = slug.toLowerCase();
  if (s.includes("oud") || s.includes("parfum")) return storefrontThemes[3];
  if (s.includes("halal")) return storefrontThemes[2];
  if (s.includes("salon")) return storefrontThemes[9];
  if (s.includes("beauty")) return storefrontThemes[1];
  if (s.includes("cake") || s.includes("tort")) return storefrontThemes[4];
  if (s.includes("iman") || s.includes("islam")) return storefrontThemes[5];
  if (s.includes("elect")) return storefrontThemes[6];
  if (s.includes("local-brand")) return storefrontThemes[7];
  if (s.includes("auto")) return storefrontThemes[8];
  if (s.includes("boutique")) return storefrontThemes[10];
  return storefrontThemes[0];
}

export function themeByNiche(niche: string) {
  const value = niche.toLowerCase();
  if (value.includes("парф")) return storefrontThemes[3];
  if (value.includes("халяль")) return storefrontThemes[2];
  if (value.includes("салон")) return storefrontThemes[9];
  if (value.includes("космет") || value.includes("beauty")) return storefrontThemes[1];
  if (value.includes("торт") || value.includes("food")) return storefrontThemes[4];
  if (value.includes("ислам")) return storefrontThemes[5];
  if (value.includes("тех")) return storefrontThemes[6];
  if (value.includes("авто")) return storefrontThemes[8];
  if (value.includes("бутик")) return storefrontThemes[10];
  return storefrontThemes[0];
}
