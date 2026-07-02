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
