"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Header from "@/src/components/Header";
import { getUserId } from "@/src/lib/auth-storage";
import { saveAddressApi } from "@/src/lib/address-api";

const LocationMap = dynamic(() => import("@/src/components/LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-3xl bg-pink-50 flex items-center justify-center text-gray-400">
      Loading map…
    </div>
  ),
});

const DEFAULT_LAT = 19.076;
const DEFAULT_LNG = 72.8777;

export default function AddressPage() {
  const router = useRouter();

  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const userId = getUserId();
    if (!userId) {
      router.push("/login?redirect=/address");
      return;
    }

    setLoading(true);
    try {
      const address = [address1.trim(), address2.trim()]
        .filter(Boolean)
        .join(", ");
      await saveAddressApi(userId, address, lat, lng);
      setSaved(true);
      setTimeout(() => router.push("/home"), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F7]">
      <Header />

      <div className="max-w-5xl mx-auto p-6">
        <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 p-8">
          <div className="absolute right-16 top-0 w-40 h-40 rounded-full bg-white/15" />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              📍 Set your delivery address
            </h1>
            <p className="text-white/90 mt-2">
              Drop the pin on your exact location so we can get to you fast.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MAP */}
          <div className="bg-white rounded-3xl p-3 shadow-sm">
            <div className="h-80 md:h-[420px]">
              <LocationMap
                lat={lat}
                lng={lng}
                onChange={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-3 px-2">
              Tap or drag the marker to pin your exact location.
            </p>
            <div className="text-xs text-gray-400 px-2 pb-1">
              Lat {lat.toFixed(6)}, Lng {lng.toFixed(6)}
            </div>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSave}
            className="bg-white rounded-3xl p-6 shadow-sm flex flex-col"
          >
            <h2 className="text-xl font-bold text-[#2E234D]">
              Address details
            </h2>

            <label className="mt-6 text-sm font-semibold text-gray-500 uppercase">
              Address line 1
            </label>
            <div className="mt-2 flex items-center border rounded-2xl px-5 py-4 bg-white">
              <input
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="Flat / House no., Building name"
                required
                className="w-full outline-none"
              />
            </div>

            <label className="mt-5 text-sm font-semibold text-gray-500 uppercase">
              Address line 2
            </label>
            <div className="mt-2 flex items-center border rounded-2xl px-5 py-4 bg-white">
              <input
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="Street, area, landmark"
                className="w-full outline-none"
              />
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
            )}

            {saved && (
              <p className="mt-4 text-sm text-green-600 text-center">
                Address saved! Taking you home…
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-full text-lg font-semibold transition"
            >
              {loading ? "Saving…" : "Save address →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
