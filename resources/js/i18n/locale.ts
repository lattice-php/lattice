import { useSyncExternalStore } from "react";
import { LATTICE_EVENT } from "../events/event-names";

export type UseLocaleReturn = {
  readonly locale: string;
  readonly setLocale: (locale: string) => void;
};

const key = "locale";
const fallback = "en";
const maxAge = 365 * 24 * 60 * 60;
const listeners = new Set<() => void>();

let active: string | undefined;

function normalize(value: string): string {
  const next = value.trim();

  return next === "" ? fallback : next;
}

function storedValue(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function cookieValue(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const item = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${key}=`));

  if (!item) {
    return null;
  }

  try {
    return decodeURIComponent(item.slice(key.length + 1));
  } catch {
    return null;
  }
}

function documentValue(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  return document.documentElement.lang || null;
}

function detectedLocale(): string {
  return normalize(storedValue() ?? cookieValue() ?? documentValue() ?? fallback);
}

function persist(locale: string): void {
  if (typeof document !== "undefined") {
    document.cookie = `${key}=${encodeURIComponent(locale)};path=/;max-age=${maxAge};SameSite=Lax`;
    document.documentElement.lang = locale;
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, locale);
    } catch {
      return;
    }
  }
}

function snapshot(): string {
  active ??= detectedLocale();

  return active;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);

  return () => {
    listeners.delete(callback);
  };
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

function dispatch(locale: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(LATTICE_EVENT.localeChange, { detail: { locale } }));
}

export function currentLocale(): string {
  return snapshot();
}

export function localeHeader(): Record<string, string> {
  return { "Accept-Language": currentLocale() };
}

export function subscribeLocale(callback: (locale: string) => void): () => void {
  return subscribe(() => callback(currentLocale()));
}

export function setLocale(locale: string): void {
  const previous = currentLocale();
  const next = normalize(locale);

  active = next;
  persist(next);

  if (next === previous) {
    return;
  }

  notify();
  dispatch(next);
}

export function useLocale(): UseLocaleReturn {
  const locale = useSyncExternalStore(subscribe, snapshot, () => fallback);

  return { locale, setLocale } as const;
}
