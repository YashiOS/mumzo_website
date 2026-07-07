"use client";

import Link from "next/link";
import { getCategoryStyle } from "@/src/lib/category-style";
import {
  isOutOfStock,
  productOriginalPrice,
  productPrice,
  type ApiProduct,
} from "@/src/lib/products-api";

export default function ProductCard({
  product,
  qty,
  onAdd,
  onRemove,
}: {
  product: ApiProduct;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const style = getCategoryStyle(product.category);
  const price = productPrice(product);
  const originalPrice = productOriginalPrice(product);
  const outOfStock = isOutOfStock(product);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
      <Link href={`/product/${product.productId}`} className="block">
        <div
          className={`relative ${style.bg} h-40 flex items-center justify-center text-5xl`}
        >
          {outOfStock ? (
            <span className="absolute top-3 left-3 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              OUT OF STOCK
            </span>
          ) : (
            !!product.discountPct && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {product.discountPct}% OFF
              </span>
            )
          )}
          {style.icon}
        </div>

        <div className="px-5 pt-5">
          <h3
            className={`font-semibold ${
              outOfStock ? "text-gray-400" : "text-[#2E234D]"
            }`}
          >
            {product.name}
          </h3>
          <p
            className={`text-sm mt-1 ${
              outOfStock ? "text-gray-300" : "text-gray-400"
            }`}
          >
            {product.brand} · {product.subcategory} · {product.packSize}
          </p>
        </div>
      </Link>

      <div className="px-5 pb-5">
        <div className="mt-5 flex items-center justify-between">
          {outOfStock ? (
            <button
              disabled
              className="ml-auto bg-gray-100 text-gray-400 px-5 py-2 rounded-full font-semibold cursor-not-allowed"
            >
              Out of stock
            </button>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                {price != null ? (
                  <span className="font-bold text-lg">₹{price}</span>
                ) : (
                  <span className="text-sm text-gray-400">
                    Price unavailable
                  </span>
                )}
                {originalPrice && (
                  <span className="text-gray-400 text-sm line-through">
                    ₹{originalPrice}
                  </span>
                )}
              </div>

              {qty > 0 ? (
                <div className="flex items-center gap-3 bg-pink-500 text-white rounded-full px-4 py-2 font-semibold">
                  <button
                    onClick={onRemove}
                    aria-label={`Decrease ${product.name} quantity`}
                  >
                    −
                  </button>
                  <span>{qty}</span>
                  <button
                    onClick={onAdd}
                    aria-label={`Increase ${product.name} quantity`}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={onAdd}
                  className="bg-pink-500 text-white px-5 py-2 rounded-full font-semibold"
                >
                  + Add
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
