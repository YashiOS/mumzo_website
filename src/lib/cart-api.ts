import type { ApiProduct } from "@/src/lib/products-api";

export type CartProduct = {
  productId: string;
  quantity: number;
  _id: string;
};

export type CartResponse = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    userId: string;
    products: CartProduct[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
};

const ADD_TO_CART_API_URL = "https://api.mumzo.in/cart/addToCart";

export async function addToCartApi(
  userId: string,
  productId: string
): Promise<CartResponse> {
  const res = await fetch(ADD_TO_CART_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, productId }),
    cache: "no-store",
  });

  const body: CartResponse = await res.json();

  if (!res.ok || !body.success) {
    throw new Error(body.message || `Add to cart failed (${res.status})`);
  }

  return body;
}

const REMOVE_FROM_CART_API_URL = "https://api.mumzo.in/cart/removeFromCart";

export async function removeFromCartApi(
  userId: string,
  productId: string
): Promise<CartResponse> {
  const res = await fetch(REMOVE_FROM_CART_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, productId }),
    cache: "no-store",
  });

  const body: CartResponse = await res.json();

  if (!res.ok || !body.success) {
    throw new Error(body.message || `Remove from cart failed (${res.status})`);
  }

  return body;
}

export type CartDetailItem = {
  productId: string;
  quantity: number;
  product: ApiProduct;
};

export type CartDetailsResponse = {
  success: boolean;
  totalItems: number;
  data: CartDetailItem[];
};

const FETCH_CART_DETAILS_API_URL = "https://api.mumzo.in/cart/fetchCartDetails";

export async function fetchCartDetailsApi(
  userId: string
): Promise<CartDetailsResponse> {
  const res = await fetch(FETCH_CART_DETAILS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
    cache: "no-store",
  });

  const body: CartDetailsResponse = await res.json();

  if (!res.ok || !body.success) {
    throw new Error(`Failed to fetch cart (${res.status})`);
  }

  return body;
}
