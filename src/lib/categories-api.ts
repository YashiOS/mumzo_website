export type CategoryRecord = {
  category: string;
  subcategory: string;
  productCount: number;
};

export type CategoryGroup = {
  category: string;
  productCount: number;
  subcategories: { subcategory: string; productCount: number }[];
};

const CATEGORIES_API_URL = "https://api.mumzo.in/category/getCategory";

type CategoriesResponse = {
  status: number;
  success: boolean;
  data: CategoryRecord[];
};

export async function fetchCategories(): Promise<CategoryRecord[]> {
  const res = await fetch(CATEGORIES_API_URL, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch categories (${res.status})`);
  }

  const body: CategoriesResponse = await res.json();
  return body.data;
}

export function categorySlug(category: string): string {
  return category.trim().toLowerCase().replace(/\s+/g, "-");
}

export function categoryFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function groupCategories(records: CategoryRecord[]): CategoryGroup[] {
  const groups = new Map<string, CategoryGroup>();

  for (const record of records) {
    const group = groups.get(record.category);
    if (group) {
      group.productCount += record.productCount;
      group.subcategories.push({
        subcategory: record.subcategory,
        productCount: record.productCount,
      });
    } else {
      groups.set(record.category, {
        category: record.category,
        productCount: record.productCount,
        subcategories: [
          { subcategory: record.subcategory, productCount: record.productCount },
        ],
      });
    }
  }

  return Array.from(groups.values());
}
