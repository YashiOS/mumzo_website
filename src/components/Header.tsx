"use client";

import Link from "next/link";
import { useCart } from "@/src/context/CartContext";

export default function Header() {
  const { cartCount } = useCart();

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
        <div className="flex-1 max-w-xl mx-10">
          <div className="bg-pink-50 rounded-full px-5 py-3">
            <input
              placeholder="Search diapers, wipes, formula, snacks..."
              className="w-full bg-transparent outline-none"
            />
          </div>
        </div>

        {/* Location */}
        <div className="hidden md:flex items-center px-4 py-2 rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
          📍 Home • ⚡ 12 min
        </div>

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

          <button className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            👤
          </button>
        </div>
      </div>
    </header>
  );
}
