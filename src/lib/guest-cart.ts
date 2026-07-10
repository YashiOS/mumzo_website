const GUEST_CART_KEY = "mumzo_guest_cart";

export type GuestCartItems = Record<string, number>;

export function getGuestCart(): GuestCartItems {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveGuestCart(items: GuestCartItems) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function clearGuestCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_CART_KEY);
}
