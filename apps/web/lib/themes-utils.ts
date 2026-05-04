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
