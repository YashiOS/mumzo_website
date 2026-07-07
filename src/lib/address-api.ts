export type SavedAddress = {
  _id: string;
  address: string;
  lat: number;
  long: number;
  isDefault: boolean;
};

export type SaveAddressResponse = {
  success: boolean;
  message: string;
  addresses?: SavedAddress[];
};

const SAVE_ADDRESS_API_URL = "https://api.mumzo.in/address/saveAddress";

export async function saveAddressApi(
  userId: string,
  address: string,
  lat: number,
  long: number
): Promise<SaveAddressResponse> {
  const res = await fetch(SAVE_ADDRESS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, address, lat, long }),
    cache: "no-store",
  });

  const body: SaveAddressResponse = await res.json();

  if (!res.ok || !body.success) {
    throw new Error(body.message || `Saving address failed (${res.status})`);
  }

  return body;
}

export type GetAddressesResponse = {
  success: boolean;
  message?: string;
  addresses: SavedAddress[];
};

const GET_ADDRESSES_API_URL = "https://api.mumzo.in/address/getAddresses";

export async function getAddressesApi(userId: string): Promise<SavedAddress[]> {
  const res = await fetch(GET_ADDRESSES_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
    cache: "no-store",
  });

  const body: GetAddressesResponse = await res.json();
  console.log("getAddresses response:", body);

  if (!res.ok || !body.success) {
    throw new Error(body.message || `Failed to fetch addresses (${res.status})`);
  }

  return body.addresses;
}

function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function findNearestAddress(
  addresses: SavedAddress[],
  lat: number,
  long: number
): SavedAddress | null {
  if (addresses.length === 0) return null;

  return addresses.reduce((nearest, addr) =>
    haversineDistanceKm(lat, long, addr.lat, addr.long) <
    haversineDistanceKm(lat, long, nearest.lat, nearest.long)
      ? addr
      : nearest
  );
}
