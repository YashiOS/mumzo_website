export type ApiProduct = {
  _id: string;
  productId: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  ageRange: string;
  mrpInr?: number;
  sellingPriceInr?: number;
  discountPct?: number;
  packSize: string;
  weightG: number;
  status?: string;
};

type ProductsResponse = {
  statusCode: number;
  message: string;
  data: ApiProduct[];
};

const PRODUCTS_API_URL = "https://api.mumzo.in/products/getSpecificProducts";
const PRODUCT_DETAIL_API_URL = "https://api.mumzo.in/products/productDetail";
const SEARCH_PRODUCTS_API_URL = "https://api.mumzo.in/products/search";

export async function fetchProductsByCategory(
  category: string
): Promise<ApiProduct[]> {
  const res = await fetch(PRODUCTS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch products (${res.status})`);
  }

  const body: ProductsResponse = await res.json();
  return body.data;
}

type ProductDetailResponse = {
  statusCode: number;
  message: string;
  data: ApiProduct | null;
};

export async function fetchProductById(
  productId: string
): Promise<ApiProduct | null> {
  const res = await fetch(PRODUCT_DETAIL_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch product (${res.status})`);
  }

  const body: ProductDetailResponse = await res.json();
  return body.data;
}

export async function searchProductsApi(query: string): Promise<ApiProduct[]> {
  const url = `${SEARCH_PRODUCTS_API_URL}?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Search failed (${res.status})`);
  }

  const body: ProductsResponse = await res.json();
  return body.data;
}

export function productPrice(product: ApiProduct): number | null {
  return product.sellingPriceInr ?? product.mrpInr ?? null;
}

export function productOriginalPrice(product: ApiProduct): number | null {
  if (
    product.mrpInr != null &&
    product.sellingPriceInr != null &&
    product.mrpInr > product.sellingPriceInr
  ) {
    return product.mrpInr;
  }
  return null;
}

export function isOutOfStock(product: ApiProduct): boolean {
  return product.status === "OUT OF STOCK";
}
