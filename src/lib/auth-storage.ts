import type { LoginResponse } from "@/src/lib/auth-api";

const USER_ID_KEY = "mumzo_userId";
const TOKEN_KEY = "mumzo_token";
const NAME_KEY = "mumzo_name";
const EMAIL_KEY = "mumzo_email";

export function saveAuthSession(login: LoginResponse) {
  localStorage.setItem(USER_ID_KEY, login.userId);
  localStorage.setItem(TOKEN_KEY, login.token);
  localStorage.setItem(NAME_KEY, login.name);
  localStorage.setItem(EMAIL_KEY, login.email);
}

export function getUserId() {
  return localStorage.getItem(USER_ID_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getName() {
  return localStorage.getItem(NAME_KEY);
}

export function getEmail() {
  return localStorage.getItem(EMAIL_KEY);
}

export function clearAuthSession() {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(EMAIL_KEY);
}
