"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/src/components/Header";
import { useCart } from "@/src/context/CartContext";
import { categorySlug } from "@/src/lib/categories-api";
import { getCategoryStyle } from "@/src/lib/category-style";
import {
  isOutOfStock,
  productOriginalPrice,
  productPrice,
  type ApiProduct,
} from "@/src/lib/products-api";

function pseudoRating(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) % 1000;
  const rating = (4.3 + (hash % 7) / 10).toFixed(1);
  const reviews = 300 + (hash % 28) * 100;
  const reviewsLabel = reviews >= 1000 ? `${(reviews / 1000).toFixed(1)}k` : `${reviews}`;
  return { rating, reviewsLabel };
}

export default function ProductDetailPage({
  product,
  related,
  error,
}: {
  product: ApiProduct | null;
  related: ApiProduct[];
  error?: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [openSection, setOpenSection] = useState<number | null>(0);
  const { addToCart } = useCart();

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#F8F5F7]">
        <Header />
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-3xl p-12 text-center text-gray-400 shadow-sm">
            {error ?? "Product not found."}
          </div>
        </div>
      </div>
    );
  }

  const style = getCategoryStyle(product.category);
  const price = productPrice(product);
  const originalPrice = productOriginalPrice(product);
  const outOfStock = isOutOfStock(product);
  const { rating, reviewsLabel } = pseudoRating(product.productId);

  const sections = [
    {
      label: "Description & highlights",
      content: `${product.subcategory} · By ${product.brand} · Pack size: ${product.packSize}.`,
    },
    {
      label: "Ingredients & materials",
      content:
        "Made with skin-friendly, hypoallergenic materials. Free from harmful chemicals and parabens.",
    },
    {
      label: "Safety & age info",
      meta: "Dermatologically tested",
      content: `Suitable for ages ${product.ageRange}. Always supervise use and follow packaging instructions.`,
    },
    {
      label: "Returns & replacement",
      content:
        "Easy 7-day returns if unused and unopened. Free replacement for damaged or incorrect items.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F7]">
      <Header />

      <div className="max-w-7xl mx-auto p-6">
        {/* BREADCRUMB */}
        <div className="text-sm text-gray-400">
          <Link href="/home" className="hover:underline">
            Home
          </Link>
          <span className="mx-2">›</span>
          <Link
            href={`/category/${categorySlug(product.category)}`}
            className="hover:underline"
          >
            {product.category}
          </Link>
          <span className="mx-2">›</span>
          <span>{product.name}</span>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* GALLERY */}
          <div
            className={`relative ${style.bg} rounded-[30px] h-96 flex items-center justify-center text-8xl overflow-hidden`}
          >
            {outOfStock && (
              <span className="absolute top-5 left-5 z-10 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                OUT OF STOCK
              </span>
            )}
            <div className="absolute right-10 top-10 w-28 h-28 rounded-full bg-white/20" />
            <span className="relative z-10">{style.icon}</span>
          </div>

          {/* DETAILS */}
          <div>
            <h1 className="text-3xl font-bold text-[#2E234D]">{product.name}</h1>
            <p className="text-gray-400 mt-1">
              by {product.brand} · {product.subcategory} · {product.packSize}
            </p>

            <div className="mt-4 flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                {product.ageRange}
              </span>
              <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
                ⭐ {rating} ({reviewsLabel})
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3">
              {price != null ? (
                <span className="text-3xl font-bold text-[#2E234D]">
                  ₹{price}
                </span>
              ) : (
                <span className="text-gray-400">Price unavailable</span>
              )}
              {originalPrice && (
                <span className="text-gray-400 line-through">
                  ₹{originalPrice}
                </span>
              )}
              {!!product.discountPct && (
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {product.discountPct}% OFF
                </span>
              )}
            </div>

            <p className="text-gray-400 text-sm mt-1">Inclusive of all taxes</p>
            <p className="text-teal-600 font-semibold text-sm mt-2">
              ⚡ Delivery in ~12 minutes
            </p>

            <div className="mt-6 flex items-center gap-4">
              {outOfStock ? (
                <button
                  disabled
                  className="bg-gray-100 text-gray-400 px-8 py-3 rounded-full font-semibold cursor-not-allowed"
                >
                  Out of stock
                </button>
              ) : (
                <>
                  <div className="flex items-center gap-4 border border-gray-200 rounded-full px-5 py-3">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      className="text-pink-500 font-bold"
                    >
                      −
                    </button>
                    <span className="font-semibold w-4 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Increase quantity"
                      className="text-pink-500 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => addToCart(product.productId, quantity)}
                    className="bg-pink-500 text-white px-8 py-3 rounded-full font-semibold"
                  >
                    🛒 Add to Cart{price != null ? ` · ₹${price * quantity}` : ""}
                  </button>
                </>
              )}
            </div>

            {/* ACCORDION */}
            <div className="mt-8 divide-y divide-gray-100 border-t border-gray-100">
              {sections.map((section, index) => {
                const open = openSection === index;
                return (
                  <div key={section.label}>
                    <button
                      onClick={() => setOpenSection(open ? null : index)}
                      className="w-full flex items-center justify-between py-4 text-left"
                    >
                      <span className="font-semibold text-[#2E234D]">
                        {section.label}
                        {section.meta && (
                          <span className="text-gray-400 font-normal"> · {section.meta}</span>
                        )}
                      </span>
                      <span className="text-gray-400">{open ? "⌃" : "⌄"}</span>
                    </button>
                    {open && (
                      <p className="text-gray-400 text-sm pb-4">{section.content}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RELATED */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-[#2E234D] mb-6">
              You might also need 🍼
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((item) => {
                const itemPrice = productPrice(item);
                return (
                  <Link
                    key={item.productId}
                    href={`/product/${item.productId}`}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm flex items-center gap-4 p-4"
                  >
                    <div
                      className={`${style.bg} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0`}
                    >
                      {style.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-[#2E234D] text-sm">
                        {item.name}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {itemPrice != null ? `₹${itemPrice}` : "—"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
