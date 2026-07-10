"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/src/lib/auth-api";
import { saveAuthSession } from "@/src/lib/auth-storage";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const login = await loginUser(email, password);
            saveAuthSession(login);
            const redirect = searchParams.get("redirect");
            router.push(redirect && redirect.startsWith("/") ? redirect : "/home");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };
  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 relative bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-300 items-center justify-center">

        <div className="absolute w-72 h-72 rounded-full bg-white/20" />

        <div className="absolute top-20 left-20 text-4xl">
          🍼
        </div>

        <div className="absolute bottom-48 left-28 text-3xl">
          💛
        </div>

        <div className="absolute top-80 right-40 text-2xl">
          🧸
        </div>

        <div className="text-center z-10 mt-60">
           <div className="relative">
    <div className="absolute left-1/2 -translate-x-1/2 -top-60 w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-lg">
      <span className="text-6xl font-bold text-black">M</span>
    </div>

          <h1 className="mt-75 text-6xl font-bold text-white">
            Mumzo
          </h1>

          <p className="text-white text-xl mt-1">
            Baby essentials, delivered in minutes.
          </p>

          <div className="mt-32 text-white text-lg">
            ⚡ 12-min delivery • 💛 Mom-trusted • 🧸 Curated & safe
          </div>
        </div>
      </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-[#F8F8F8]">
        <div className="w-full max-w-md px-8">

          <h2 className="text-5xl font-bold text-[#2E234D] text-center">
            Welcome back 👋
          </h2>

          <p className="text-center text-gray-500 mt-3 text-lg">
            Log in or sign up to start shopping.
          </p>

          <form onSubmit={handleLogin} className="mt-12">
            <label className="text-sm font-semibold text-gray-500 uppercase">
              Email
            </label>

            <div className="mt-2 flex items-center border rounded-2xl px-5 py-5 bg-white">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full outline-none"
              />
            </div>

            <label className="mt-6 block text-sm font-semibold text-gray-500 uppercase">
              Password
            </label>

            <div className="mt-2 flex items-center border rounded-2xl px-5 py-5 bg-white">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full outline-none"
              />
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-5 rounded-full text-xl font-semibold transition"
            >
              {loading ? "Logging in…" : "Log In →"}
            </button>
          </form>

          <div className="flex items-center my-10">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="mx-4 text-gray-400">
              or
            </span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="border rounded-full py-4 font-medium bg-white">
              🟢 Google
            </button>

            <button className="border rounded-full py-4 font-medium bg-white">
              🍎 Apple
            </button>
          </div>

          <p className="text-center text-gray-400 text-sm mt-10">
            By continuing you agree to our Terms &
            Privacy.
          </p>
        </div>
      </div>
    </div>
  );
}