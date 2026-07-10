"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addToCartApi,
  fetchCartDetailsApi,
  removeFromCartApi,
  type CartDetailItem,
} from "@/src/lib/cart-api";
import { fetchProductById } from "@/src/lib/products-api";
import { getUserId, onAuthChange } from "@/src/lib/auth-storage";
import {
  clearGuestCart,
  getGuestCart,
  saveGuestCart,
} from "@/src/lib/guest-cart";

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

async function fetchGuestCartDetails(
  guestItems: CartItems
): Promise<CartDetailItem[]> {
  const entries = Object.entries(guestItems);

  const details = await Promise.all(
    entries.map(async ([productId, quantity]) => {
      try {
        const product = await fetchProductById(productId);
        if (!product) return null;
        return { productId, quantity, product };
      } catch (err) {
        console.error("Failed to fetch guest cart product:", err);
        return null;
      }
    })
  );

  return details.filter((d): d is CartDetailItem => d !== null);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItems>({});
  const [cartDetails, setCartDetails] = useState<CartDetailItem[]>([]);
  const cartDetailsRef = useRef<CartDetailItem[]>([]);
  const wasLoggedIn = useRef(false);

  useEffect(() => {
    cartDetailsRef.current = cartDetails;
  }, [cartDetails]);

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

  const loadGuestCart = useCallback(async () => {
    const guestItems = getGuestCart();
    const details = await fetchGuestCartDetails(guestItems);
    setCartDetails(details);
    setItems(itemsFromCartDetails(details));
  }, []);

  const mergeGuestCartIntoAccount = useCallback(
    async (userId: string) => {
      const guestItems = getGuestCart();
      const entries = Object.entries(guestItems);
      if (entries.length === 0) {
        await refreshCart();
        return;
      }

      try {
        for (const [productId, qty] of entries) {
          for (let i = 0; i < qty; i++) {
            await addToCartApi(userId, productId);
          }
        }
        clearGuestCart();
      } catch (err) {
        console.error("Failed to merge guest cart:", err);
      }

      await refreshCart();
    },
    [refreshCart]
  );

  useEffect(() => {
    async function init() {
      const userId = getUserId();
      if (userId) {
        wasLoggedIn.current = true;
        await mergeGuestCartIntoAccount(userId);
      } else {
        wasLoggedIn.current = false;
        await loadGuestCart();
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return onAuthChange(() => {
      const userId = getUserId();
      if (userId && !wasLoggedIn.current) {
        wasLoggedIn.current = true;
        mergeGuestCartIntoAccount(userId);
      } else if (!userId && wasLoggedIn.current) {
        wasLoggedIn.current = false;
        loadGuestCart();
      }
    });
  }, [mergeGuestCartIntoAccount, loadGuestCart]);

  const addToCart = useCallback(
    (id: string, qty: number = 1) => {
      setItems((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + qty }));

      const userId = getUserId();
      if (!userId) {
        const guestItems = getGuestCart();
        const nextQty = (guestItems[id] ?? 0) + qty;
        guestItems[id] = nextQty;
        saveGuestCart(guestItems);

        if (cartDetailsRef.current.some((d) => d.productId === id)) {
          setCartDetails((prev) =>
            prev.map((d) =>
              d.productId === id ? { ...d, quantity: nextQty } : d
            )
          );
        } else {
          fetchProductById(id)
            .then((product) => {
              if (!product) return;
              setCartDetails((prev) => {
                if (prev.some((d) => d.productId === id)) return prev;
                return [...prev, { productId: id, quantity: nextQty, product }];
              });
            })
            .catch((err) =>
              console.error("Failed to fetch product for guest cart:", err)
            );
        }
        return;
      }

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
      if (!userId) {
        const guestItems = getGuestCart();
        const nextQty = (guestItems[id] ?? 0) - 1;
        if (nextQty <= 0) {
          delete guestItems[id];
          setCartDetails((prev) => prev.filter((d) => d.productId !== id));
        } else {
          guestItems[id] = nextQty;
          setCartDetails((prev) =>
            prev.map((d) =>
              d.productId === id ? { ...d, quantity: nextQty } : d
            )
          );
        }
        saveGuestCart(guestItems);
        return;
      }

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

  const clearCart = useCallback(() => {
    setItems({});
    setCartDetails([]);
    clearGuestCart();
  }, []);

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
