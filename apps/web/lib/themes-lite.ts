export type StoreThemeLite = {
  code: string;
  title: string;
  category: string;
  hero: string;
  tagline: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
  image: string;
  mood: string;
};

export const storefrontThemesLite: StoreThemeLite[] = [
  {
    code: "premium-fashion",
    title: "Modest Fashion",
    category: "Женская одежда",
    hero: "Большой fashion hero, мягкие карточки, editorial-композиция.",
    tagline: "Коллекция, которую удобно заказать сегодня",
    accent: "#9A365F",
    bg: "#FAFAF7",
    surface: "#FFFFFF",
    text: "#141414",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=80",
    mood: "Editorial"
  },
  {
    code: "beauty",
    title: "Beauty",
    category: "Косметика",
    hero: "Чистый beauty-ритейл, свет, воздух, аккуратные детали.",
    tagline: "Уход, который легко выбрать и заказать",
    accent: "#277C8E",
    bg: "#F7FBFA",
    surface: "#FFFFFF",
    text: "#102326",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=80",
    mood: "Clean"
  },
  {
    code: "halal-market",
    title: "Halal Market",
    category: "Халяль-продукты",
    hero: "Практичный grocery layout, быстрый заказ, доверие к доставке.",
    tagline: "Свежие продукты с понятной доставкой",
    accent: "#5BA97D",
    bg: "#F8FAF4",
    surface: "#FFFFFF",
    text: "#17311F",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80",
    mood: "Fresh"
  },
  {
    code: "perfume-luxury",
    title: "Luxury Perfume",
    category: "Парфюм",
    hero: "Темная luxury-витрина с сильным фокусом на продукт.",
    tagline: "Ароматы, которые выглядят как подарок",
    accent: "#E7A83E",
    bg: "#111111",
    surface: "#1C1A18",
    text: "#FFF8ED",
    image: "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=1400&q=80",
    mood: "Luxury"
  },
  {
    code: "cakes-food",
    title: "Cakes & Food",
    category: "Торты",
    hero: "Аппетитная витрина с крупными фото и быстрым checkout.",
    tagline: "Торты и десерты к вашему событию",
    accent: "#C46A4A",
    bg: "#FFF8F2",
    surface: "#FFFFFF",
    text: "#2B1810",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1400&q=80",
    mood: "Warm"
  },
  {
    code: "islamic-store",
    title: "Islamic Goods",
    category: "Исламские товары",
    hero: "Спокойная, уважительная витрина для книг, подарков и товаров.",
    tagline: "Книги, подарки и товары с уважительной подачей",
    accent: "#277C8E",
    bg: "#F8F7F2",
    surface: "#FFFFFF",
    text: "#172326",
    image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1400&q=80",
    mood: "Calm"
  },
  {
    code: "electronics",
    title: "Electronics",
    category: "Техника",
    hero: "Плотная витрина техники с акцентом на характеристики и наличие.",
    tagline: "Техника в наличии, заказ за минуту",
    accent: "#5165F6",
    bg: "#F5F7FB",
    surface: "#FFFFFF",
    text: "#111827",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    mood: "Tech"
  },
  {
    code: "local-brand",
    title: "Local Brand",
    category: "Локальный бренд",
    hero: "Современная локальная витрина с фокусом на доверие и близость.",
    tagline: "Локальный бренд, который выглядит федерально",
    accent: "#E7A83E",
    bg: "#F7F5EE",
    surface: "#FFFFFF",
    text: "#1F211D",
    image: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1400&q=80",
    mood: "Local"
  },
  {
    code: "auto-parts",
    title: "Auto Parts",
    category: "Автотовары",
    hero: "Функциональная витрина автотоваров с быстрым подбором и звонком.",
    tagline: "Запчасти и аксессуары без долгих переписок",
    accent: "#D94C32",
    bg: "#F4F5F7",
    surface: "#FFFFFF",
    text: "#111827",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1400&q=80",
    mood: "Utility"
  },
  {
    code: "beauty-salon",
    title: "Beauty Salon",
    category: "Услуги красоты",
    hero: "Витрина услуг с записью, портфолио и быстрым контактом.",
    tagline: "Запись на услуги через один экран",
    accent: "#B85C82",
    bg: "#FFF7FB",
    surface: "#FFFFFF",
    text: "#23121A",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=80",
    mood: "Soft service"
  },
  {
    code: "premium-boutique",
    title: "Premium Boutique",
    category: "Бутик",
    hero: "Бутик-витрина с дорогой подачей, крупными фото и подбором.",
    tagline: "Премиальный ассортимент с персональным подбором",
    accent: "#141414",
    bg: "#F5F2EA",
    surface: "#FFFFFF",
    text: "#141414",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80",
    mood: "Boutique"
  }
];
