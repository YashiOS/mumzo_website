"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  clearAuthSession,
  getUserId,
  onAuthChange,
  useIsLoggedIn,
} from "@/src/lib/auth-storage";
import { fetchProfileApi, type Profile } from "@/src/lib/auth-api";
import type { SavedAddress } from "@/src/lib/address-api";

type Tab = "profile" | "address";

export default function ProfileMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isLoggedIn = useIsLoggedIn();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return onAuthChange(() => {
      setProfile(null);
      setError("");
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open || profile || !isLoggedIn) return;

    async function run() {
      const userId = getUserId();
      if (!userId) return;

      setLoading(true);
      setError("");

      try {
        const result = await fetchProfileApi(userId);
        setProfile(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [open, profile, isLoggedIn]);

  const handleLoginClick = () => {
    setOpen(false);
    router.push(`/login?redirect=${encodeURIComponent(pathname || "/home")}`);
  };

  const handleLogout = () => {
    clearAuthSession();
    setProfile(null);
    setOpen(false);
    router.push("/home");
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={isLoggedIn ? "Profile" : "Log in"}
        className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center"
      >
        👤
      </button>

      {open && (
        <div className="absolute right-0 top-14 w-80 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden z-20">
          {!isLoggedIn ? (
            <div className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
                👤
              </div>
              <p className="text-sm text-gray-500">
                Log in to view your profile, saved addresses, and order
                history.
              </p>
              <button
                onClick={handleLoginClick}
                className="w-full bg-pink-500 text-white py-3 rounded-full font-semibold"
              >
                Log in
              </button>
            </div>
          ) : (
            <>
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setTab("profile")}
                  className={`flex-1 py-3 text-sm font-semibold ${
                    tab === "profile"
                      ? "text-pink-500 border-b-2 border-pink-500"
                      : "text-gray-400"
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setTab("address")}
                  className={`flex-1 py-3 text-sm font-semibold ${
                    tab === "address"
                      ? "text-pink-500 border-b-2 border-pink-500"
                      : "text-gray-400"
                  }`}
                >
                  Address
                </button>
              </div>

              <div className="p-5">
                {loading ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Loading…
                  </p>
                ) : error ? (
                  <p className="text-sm text-red-500 text-center py-4">
                    {error}
                  </p>
                ) : tab === "profile" ? (
                  <ProfileTab profile={profile} />
                ) : (
                  <AddressTab addresses={profile?.addresses ?? []} />
                )}
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-3 text-sm font-semibold text-gray-500 border-t border-gray-100 hover:bg-gray-50"
              >
                Log out
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileTab({ profile }: { profile: Profile | null }) {
  if (!profile) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl shrink-0">
        👤
      </div>
      <div>
        <p className="font-semibold text-[#2E234D]">{profile.name}</p>
        <p className="text-sm text-gray-400 mt-0.5">{profile.email}</p>
      </div>
    </div>
  );
}

function AddressTab({ addresses }: { addresses: SavedAddress[] }) {
  return (
    <div className="flex flex-col gap-3">
      {addresses.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          No saved addresses yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="border border-gray-100 rounded-2xl px-4 py-3"
            >
              <span className="text-sm font-semibold text-[#2E234D]">
                📍 {addr.address}
              </span>
              {addr.isDefault && (
                <span className="mt-1 block w-fit text-xs font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                  Default
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <Link
        href="/address"
        className="mt-2 text-center bg-pink-500 text-white py-3 rounded-full font-semibold"
      >
        + Add address
      </Link>
    </div>
  );
}
