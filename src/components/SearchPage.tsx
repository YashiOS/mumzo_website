"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/src/components/Header";
import ProductCard from "@/src/components/ProductCard";
import { useCart } from "@/src/context/CartContext";
import { searchProductsApi, type ApiProduct } from "@/src/lib/products-api";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";

  const [results, setResults] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { items: cart, addToCart, decrementFromCart } = useCart();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!query) {
        setResults([]);
        setError("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const products = await searchProductsApi(query);
        if (!cancelled) setResults(products);
      } catch (err) {
        if (!cancelled) {
          setResults([]);
          setError(err instanceof Error ? err.message : "Search failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="min-h-screen bg-[#F8F5F7]">
      <Header initialQuery={query} />

      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2E234D]">
          {query ? `Results for "${query}"` : "Search"}
        </h1>
        {query && !loading && !error && (
          <p className="text-gray-400 mt-1">
            {results.length} product{results.length === 1 ? "" : "s"} found
          </p>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl h-64 shadow-sm animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-400 shadow-sm">
              {error}
            </div>
          ) : !query ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-400 shadow-sm">
              Start typing in the search bar above to find products.
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-400 shadow-sm">
              No products match &quot;{query}&quot;. Try a different search
              term.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {results.map((product) => (
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
    </div>
  );
}
