export const CATEGORY_STYLES: Record<string, { icon: string; bg: string }> = {
  "Baby Gear": { icon: "🚼", bg: "bg-blue-100" },
  Clothing: { icon: "👕", bg: "bg-yellow-100" },
  Diapering: { icon: "👶", bg: "bg-pink-100" },
  Feeding: { icon: "🍼", bg: "bg-teal-100" },
  Health: { icon: "💊", bg: "bg-orange-100" },
  "Mom Care": { icon: "🤱", bg: "bg-purple-100" },
  Pregnancy: { icon: "🤰", bg: "bg-green-100" },
  Skincare: { icon: "🧴", bg: "bg-blue-100" },
  Toys: { icon: "🧸", bg: "bg-purple-100" },
};

const DEFAULT_CATEGORY_STYLE = { icon: "🛍️", bg: "bg-gray-100" };

export function getCategoryStyle(category: string) {
  return CATEGORY_STYLES[category] ?? DEFAULT_CATEGORY_STYLE;
}
