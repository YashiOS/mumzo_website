import type { SavedAddress } from "@/src/lib/address-api";

export type Profile = {
  _id: string;
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  addresses: SavedAddress[];
};

export type ProfileResponse = {
  success: boolean;
  message: string;
  data: Profile;
};

const PROFILE_API_URL = "https://api.mumzo.in/auth/profile";

export async function fetchProfileApi(userId: string): Promise<Profile> {
  const res = await fetch(PROFILE_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
    cache: "no-store",
  });

  const body: ProfileResponse = await res.json();

  if (!res.ok || !body.success) {
    throw new Error(body.message || `Failed to fetch profile (${res.status})`);
  }

  return body.data;
}

export type LoginResponse = {
  success: boolean;
  message: string;
  token: string;
  userId: string;
  name: string;
  email: string;
};

const LOGIN_API_URL = "https://api.mumzo.in/auth/login";

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(LOGIN_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const body: LoginResponse = await res.json();

  if (!res.ok || !body.success) {
    throw new Error(body.message || `Login failed (${res.status})`);
  }

  return body;
}
