"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addToCartApi,
  fetchCartDetailsApi,
  removeFromCartApi,
  type CartDetailItem,
} from "@/src/lib/cart-api";
import { getUserId } from "@/src/lib/auth-storage";

type CartItems = Record<string, number>;

type CartContextValue = {
  items: CartItems;
  cartDetails: CartDetailItem[];
  cartCount: number;
  addToCart: (id: string, qty?: number) => void;
  decrementFromCart: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function itemsFromCartDetails(details: CartDetailItem[]): CartItems {
  const items: CartItems = {};
  for (const detail of details) {
    items[detail.productId] = detail.quantity;
  }
  return items;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItems>({});
  const [cartDetails, setCartDetails] = useState<CartDetailItem[]>([]);

  const refreshCart = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const res = await fetchCartDetailsApi(userId);
      setCartDetails(res.data);
      setItems(itemsFromCartDetails(res.data));
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const userId = getUserId();
    if (!userId) return;

    fetchCartDetailsApi(userId)
      .then((res) => {
        if (ignore) return;
        setCartDetails(res.data);
        setItems(itemsFromCartDetails(res.data));
      })
      .catch((err) => {
        if (!ignore) console.error("Failed to fetch cart:", err);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const addToCart = useCallback(
    (id: string, qty: number = 1) => {
      setItems((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + qty }));

      const userId = getUserId();
      if (!userId) return;

      (async () => {
        try {
          for (let i = 0; i < qty; i++) {
            await addToCartApi(userId, id);
          }
          await refreshCart();
        } catch (err) {
          console.error("Failed to add item to cart:", err);
        }
      })();
    },
    [refreshCart]
  );

  const decrementFromCart = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = { ...prev };
        const qty = (next[id] ?? 0) - 1;
        if (qty <= 0) {
          delete next[id];
        } else {
          next[id] = qty;
        }
        return next;
      });

      const userId = getUserId();
      if (!userId) return;

      (async () => {
        try {
          await removeFromCartApi(userId, id);
          await refreshCart();
        } catch (err) {
          console.error("Failed to remove item from cart:", err);
        }
      })();
    },
    [refreshCart]
  );

  const clearCart = useCallback(() => setItems({}), []);

  const cartCount = useMemo(
    () => Object.values(items).reduce((sum, qty) => sum + qty, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        cartDetails,
        cartCount,
        addToCart,
        decrementFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
