"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/src/context/CartContext";
import ProfileMenu from "@/src/components/ProfileMenu";

export default function Header({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const { cartCount } = useCart();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const timeout = setTimeout(() => {
      router.replace(`/search?q=${encodeURIComponent(trimmed)}`);
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-gray-800 rounded-xl flex items-center justify-center font-bold text-xl">
            M
          </div>
          <span className="text-2xl font-bold text-[#2E234D]">Mumzo</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-xl mx-10">
          <div className="bg-pink-50 rounded-full px-5 py-3 flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search diapers, wipes, formula, snacks..."
              className="w-full bg-transparent outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="text-gray-400 shrink-0"
            >
              🔍
            </button>
          </div>
        </form>

        {/* Location */}
        <Link
          href="/address"
          className="hidden md:flex items-center px-4 py-2 rounded-full bg-teal-100 text-sm font-semibold text-teal-700 hover:bg-teal-200 transition"
        >
          📍 Home • ⚡ 12 min
        </Link>

        {/* Icons */}
        <div className="flex items-center gap-4 ml-5">
          <Link
            href="/checkout"
            className="relative w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center"
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-xs font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
