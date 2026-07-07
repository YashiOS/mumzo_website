"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/src/components/Header";
import ProductCard from "@/src/components/ProductCard";
import { useCart } from "@/src/context/CartContext";
import { productPrice, type ApiProduct } from "@/src/lib/products-api";

type SortOption = "default" | "price-asc" | "price-desc";

export default function CategoryPage({
  categoryTitle,
  products,
  error,
}: {
  categoryTitle: string;
  products: ApiProduct[];
  error?: string;
}) {
  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))),
    [products]
  );
  const subcategories = useMemo(
    () => Array.from(new Set(products.map((p) => p.subcategory))),
    [products]
  );
  const priceBound = useMemo(() => {
    const prices = products
      .map((p) => productPrice(p))
      .filter((price): price is number => price != null);
    return prices.length > 0 ? Math.max(...prices) : 0;
  }, [products]);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    []
  );
  const [maxPrice, setMaxPrice] = useState(priceBound);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const { items: cart, addToCart, decrementFromCart } = useCart();

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleSubcategory = (subcategory: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategory)
        ? prev.filter((s) => s !== subcategory)
        : [...prev, subcategory]
    );
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedSubcategories([]);
    setMaxPrice(priceBound);
    setSortBy("default");
  };

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }
      if (
        selectedSubcategories.length > 0 &&
        !selectedSubcategories.includes(product.subcategory)
      ) {
        return false;
      }
      const price = productPrice(product);
      return price == null || price <= maxPrice;
    });

    if (sortBy === "price-asc") {
      return [...filtered].sort(
        (a, b) => (productPrice(a) ?? 0) - (productPrice(b) ?? 0)
      );
    }
    if (sortBy === "price-desc") {
      return [...filtered].sort(
        (a, b) => (productPrice(b) ?? 0) - (productPrice(a) ?? 0)
      );
    }
    return filtered;
  }, [products, selectedBrands, selectedSubcategories, maxPrice, sortBy]);

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
          <span>{categoryTitle}</span>
        </div>

        {/* TITLE */}
        <div className="mt-2 flex items-end justify-between">
          <h1 className="text-4xl font-bold text-[#2E234D]">{categoryTitle}</h1>
          <span className="text-gray-400">{products.length} products</span>
        </div>

        {error ? (
          <div className="mt-8 bg-white rounded-3xl p-12 text-center text-gray-400 shadow-sm">
            {error}
          </div>
        ) : (
          <div className="mt-6 flex flex-col lg:flex-row gap-8">
            {/* FILTERS */}
            <aside className="w-full lg:w-72 shrink-0">
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-[#2E234D]">Filters</h2>
                  <button
                    onClick={clearFilters}
                    className="text-pink-500 text-sm font-semibold"
                  >
                    Clear
                  </button>
                </div>

                {/* SORT BY */}
                <div className="mt-6">
                  <p className="text-xs font-semibold text-gray-400 tracking-wide">
                    SORT BY
                  </p>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="mt-2 w-full bg-gray-50 rounded-xl px-4 py-3 outline-none"
                  >
                    <option value="default">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>

                {/* BRAND */}
                <div className="mt-6">
                  <p className="text-xs font-semibold text-gray-400 tracking-wide">
                    BRAND
                  </p>
                  <div className="mt-3 flex flex-col gap-3">
                    {brands.map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center gap-3 text-sm text-[#2E234D]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="w-4 h-4 accent-pink-500"
                        />
                        {brand}
                      </label>
                    ))}
                  </div>
                </div>

                {/* SUBCATEGORY */}
                <div className="mt-6">
                  <p className="text-xs font-semibold text-gray-400 tracking-wide">
                    SUBCATEGORY
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {subcategories.map((subcategory) => {
                      const active = selectedSubcategories.includes(subcategory);
                      return (
                        <button
                          key={subcategory}
                          onClick={() => toggleSubcategory(subcategory)}
                          className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                            active
                              ? "bg-pink-500 text-white border-pink-500"
                              : "bg-white text-gray-600 border-gray-200"
                          }`}
                        >
                          {subcategory}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PRICE */}
                <div className="mt-6">
                  <p className="text-xs font-semibold text-gray-400 tracking-wide">
                    PRICE
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={priceBound}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="mt-4 w-full accent-pink-500"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>₹0</span>
                    <span>₹{maxPrice}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* PRODUCTS */}
            <div className="flex-1">
              {visibleProducts.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center text-gray-400 shadow-sm">
                  No products match your filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      qty={cart[product.productId] ?? 0}
                      onAdd={() => addToCart(product.productId)}
                      onRemove={() => decrementFromCart(product.productId)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
