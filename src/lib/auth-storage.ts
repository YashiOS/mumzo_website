import { useSyncExternalStore } from "react";
import type { LoginResponse } from "@/src/lib/auth-api";

const USER_ID_KEY = "mumzo_userId";
const TOKEN_KEY = "mumzo_token";
const NAME_KEY = "mumzo_name";
const EMAIL_KEY = "mumzo_email";
const AUTH_CHANGE_EVENT = "mumzo-auth-changed";

function notifyAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function onAuthChange(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  return () => window.removeEventListener(AUTH_CHANGE_EVENT, callback);
}

export function saveAuthSession(login: LoginResponse) {
  localStorage.setItem(USER_ID_KEY, login.userId);
  localStorage.setItem(TOKEN_KEY, login.token);
  localStorage.setItem(NAME_KEY, login.name);
  localStorage.setItem(EMAIL_KEY, login.email);
  notifyAuthChange();
}

export function getUserId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_KEY);
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getName() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(NAME_KEY);
}

export function getEmail() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

export function clearAuthSession() {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(EMAIL_KEY);
  notifyAuthChange();
}

function getIsLoggedInSnapshot() {
  return !!getUserId();
}

function getIsLoggedInServerSnapshot() {
  return false;
}

export function useIsLoggedIn(): boolean {
  return useSyncExternalStore(
    onAuthChange,
    getIsLoggedInSnapshot,
    getIsLoggedInServerSnapshot
  );
}
