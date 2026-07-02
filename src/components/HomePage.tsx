"use client";

import Link from "next/link";
import Header from "@/src/components/Header";
import { useCart } from "@/src/context/CartContext";
import { getProductById } from "@/src/data/categories";
import { categorySlug, type CategoryGroup } from "@/src/lib/categories-api";
import { getCategoryStyle } from "@/src/lib/category-style";

const BESTSELLER_IDS = [
  "soft-care-diapers-m",
  "gentle-baby-wipes",
  "diaper-rash-cream",
  "fruit-puree-pack",
];

export default function HomePage({
  categories,
}: {
  categories: CategoryGroup[];
}) {
  const products = BESTSELLER_IDS.map(
    (id) => getProductById(id)!.product
  );
  const { items: cart, addToCart, decrementFromCart } = useCart();

  return (
    <div className="min-h-screen bg-[#F8F5F7]">
      <Header />

      <div className="max-w-7xl mx-auto p-6">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 p-8 h-[230px]">
          <div className="absolute right-16 top-0 w-52 h-52 rounded-full bg-white/15" />
          <div className="absolute right-6 bottom-6 w-16 h-16 rounded-full bg-white/20" />

          <div className="relative z-10">
            <h1 className="text-5xl font-bold text-white">
              20% off your first order!
            </h1>

            <p className="text-white/90 text-xl mt-4">
              Everything baby & mom — at your door in minutes.
            </p>

            <button className="mt-8 bg-white text-pink-500 px-8 py-4 rounded-full font-bold">
              Shop now →
            </button>
          </div>
        </div>

        {/* CATEGORIES */}
        <section className="mt-10">
          <h2 className="text-3xl font-bold text-[#2E234D] mb-6">
            Shop by category
          </h2>

          {categories.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-400 shadow-sm">
              Couldn&apos;t load categories. Make sure the API at api.mumzo.in
              is running.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {categories.map((group) => {
                const style = getCategoryStyle(group.category);
                return (
                  <Link
                    key={group.category}
                    href={`/category/${categorySlug(group.category)}`}
                    className={`${style.bg} rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition`}
                  >
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl">
                      {style.icon}
                    </div>

                    <span className="mt-4 font-semibold text-[#2E234D]">
                      {group.category}
                    </span>
                    <span className="mt-1 text-sm text-gray-500">
                      {group.productCount} products
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* BESTSELLERS */}
        <section className="mt-12">
          <h2 className="text-3xl font-bold text-[#2E234D] mb-6">
            Bestsellers ⭐
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {products.map((product) => {
              const qty = cart[product.id] ?? 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm"
                >
                  <Link href={`/product/${product.id}`} className="block">
                    <div
                      className={`${product.bg} h-44 flex items-center justify-center text-5xl`}
                    >
                      {product.emoji}
                    </div>

                    <h3 className="font-semibold text-[#2E234D] px-5 pt-5">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="px-5 pb-5">
                    <div className="mt-5 flex items-center justify-between">
                      <span className="font-bold text-lg">₹{product.price}</span>

                      {qty > 0 ? (
                        <div className="flex items-center gap-3 bg-pink-500 text-white rounded-full px-4 py-2 font-semibold">
                          <button
                            onClick={() => decrementFromCart(product.id)}
                            aria-label={`Decrease ${product.name} quantity`}
                          >
                            −
                          </button>
                          <span>{qty}</span>
                          <button
                            onClick={() => addToCart(product.id)}
                            aria-label={`Increase ${product.name} quantity`}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product.id)}
                          className="bg-pink-500 text-white px-5 py-2 rounded-full font-semibold"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
