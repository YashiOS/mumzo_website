"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/src/context/CartContext";
import { getCategoryStyle } from "@/src/lib/category-style";
import { productPrice } from "@/src/lib/products-api";
import { getUserId } from "@/src/lib/auth-storage";
import {
  findNearestAddress,
  getAddressesApi,
  type SavedAddress,
} from "@/src/lib/address-api";

const DELIVERY_FEE = 25;
const HANDLING_FEE = 15;
const PROMO_CODE = "FIRST20";
const PROMO_DISCOUNT_RATE = 0.2;

export default function CheckoutPage() {
  const { cartDetails, addToCart, decrementFromCart, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(false);
  const [promoError, setPromoError] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(
    null
  );
  const [addressLoading, setAddressLoading] = useState(true);

  useEffect(() => {
    async function run() {
      const userId = getUserId();
      if (!userId) {
        setAddressLoading(false);
        return;
      }

      try {
        const addresses = await getAddressesApi(userId);

        if (addresses.length === 0) {
          setSelectedAddress(null);
          return;
        }

        if (!navigator.geolocation) {
          setSelectedAddress(addresses[0]);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setSelectedAddress(
              findNearestAddress(
                addresses,
                pos.coords.latitude,
                pos.coords.longitude
              ) ?? addresses[0]
            );
          },
          () => setSelectedAddress(addresses[0]),
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } catch {
        setSelectedAddress(null);
      } finally {
        setAddressLoading(false);
      }
    }

    run();
  }, []);

  const cartItems = useMemo(
    () =>
      cartDetails.map(({ product, quantity }) => ({ product, qty: quantity })),
    [cartDetails]
  );

  const itemTotal = cartItems.reduce(
    (sum, { product, qty }) => sum + (productPrice(product) ?? 0) * qty,
    0
  );
  const discount = appliedPromo ? Math.round(itemTotal * PROMO_DISCOUNT_RATE) : 0;
  const totalPayable = cartItems.length > 0 ? itemTotal + DELIVERY_FEE + HANDLING_FEE - discount : 0;

  const handleApplyPromo = () => {
    const isValid = promoCode.trim().toUpperCase() === PROMO_CODE;
    setAppliedPromo(isValid);
    setPromoError(!isValid);
  };

  const handlePay = () => {
    if (cartItems.length === 0) return;
    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#F8F5F7] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm max-w-md">
          <div className="text-5xl">✅</div>
          <h1 className="text-2xl font-bold text-[#2E234D] mt-4">Order placed!</h1>
          <p className="text-gray-400 mt-2">
            Arriving in ~12 minutes. Thank you for shopping with Mumzo.
          </p>
          <Link
            href="/home"
            className="mt-6 inline-block bg-pink-500 text-white px-8 py-3 rounded-full font-semibold"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F7]">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-gray-800 rounded-xl flex items-center justify-center font-bold text-xl">
              M
            </div>
            <span className="text-2xl font-bold text-[#2E234D]">Mumzo</span>
          </Link>
          <span className="text-green-600 text-sm font-semibold">
            🔒 Secure checkout
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-[#2E234D] mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="flex flex-col gap-6">
            {/* DELIVER TO */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[#2E234D]">1 · Deliver to</h2>
                <Link href="/address" className="text-pink-500 text-sm font-semibold">
                  Change
                </Link>
              </div>
              {addressLoading ? (
                <p className="mt-3 text-gray-400 text-sm">Loading address…</p>
              ) : selectedAddress ? (
                <>
                  <p className="mt-3 font-semibold text-[#2E234D]">
                    📍 Delivery address
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {selectedAddress.address} · ⚡ arriving in ~12 min
                  </p>
                </>
              ) : (
                <div className="mt-3">
                  <p className="text-gray-400 text-sm">No saved address yet.</p>
                  <Link
                    href="/address"
                    className="text-pink-500 text-sm font-semibold"
                  >
                    Add an address →
                  </Link>
                </div>
              )}
            </div>

            {/* PAYMENT METHOD */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h2 className="font-bold text-[#2E234D]">2 · Payment method</h2>

              <div className="mt-4 flex flex-col gap-3">
                <div className="border border-pink-400 bg-pink-50 rounded-2xl px-5 py-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-3 font-semibold text-[#2E234D]">
                      📦 Cash on Delivery
                    </span>
                    <input
                      type="radio"
                      name="payment"
                      checked
                      readOnly
                      className="w-5 h-5 accent-pink-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="bg-white rounded-3xl p-6 shadow-sm lg:sticky lg:top-6 self-start">
            <h2 className="font-bold text-[#2E234D] text-lg">Order summary</h2>

            {cartItems.length === 0 ? (
              <div className="mt-4 text-center text-gray-400 text-sm py-6">
                Your cart is empty.
                <div>
                  <Link href="/home" className="text-pink-500 font-semibold">
                    Browse categories
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                {cartItems.map(({ product, qty }) => {
                  const style = getCategoryStyle(product.category);
                  const price = productPrice(product) ?? 0;
                  return (
                    <div key={product.productId} className="flex items-center gap-3">
                      <div
                        className={`${style.bg} w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0`}
                      >
                        {style.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-[#2E234D]">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => decrementFromCart(product.productId)}
                            aria-label={`Decrease ${product.name} quantity`}
                            className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center"
                          >
                            −
                          </button>
                          <span className="text-gray-500 text-xs">Qty {qty}</span>
                          <button
                            onClick={() => addToCart(product.productId)}
                            aria-label={`Increase ${product.name} quantity`}
                            className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <span className="font-semibold text-sm">₹{price * qty}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="🎁 Promo code"
                className="flex-1 bg-gray-50 rounded-xl px-4 py-3 outline-none text-sm"
              />
              <button
                onClick={handleApplyPromo}
                className="bg-purple-600 text-white px-5 rounded-xl font-semibold text-sm"
              >
                Apply
              </button>
            </div>
            {appliedPromo && (
              <p className="text-xs mt-2 text-green-600">
                {PROMO_CODE} applied — 20% off
              </p>
            )}
            {promoError && (
              <p className="text-xs mt-2 text-red-500">Invalid promo code</p>
            )}

            <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Item total</span>
                <span>₹{itemTotal}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery fee</span>
                <span>₹{DELIVERY_FEE}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Handling fee</span>
                <span>₹{HANDLING_FEE}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({PROMO_CODE})</span>
                  <span>−₹{discount}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between font-bold text-[#2E234D]">
              <span>Total payable</span>
              <span>₹{totalPayable}</span>
            </div>

            <button
              onClick={handlePay}
              disabled={cartItems.length === 0}
              className="mt-5 w-full bg-pink-500 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-full font-bold"
            >
              Place order
            </button>
            <p className="text-center text-gray-400 text-xs mt-2">
              🔒 100% secure · Pay ₹{totalPayable} in cash on delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
