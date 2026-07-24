import { useSyncExternalStore } from "react";

const appearances = ["light", "dark", "system"] as const;

export type Appearance = (typeof appearances)[number];

export type ResolvedAppearance = "light" | "dark";

export type UseAppearanceReturn = {
  readonly appearance: Appearance;
  readonly resolvedAppearance: ResolvedAppearance;
  readonly updateAppearance: (mode: Appearance) => void;
};

const listeners = new Set<() => void>();
let currentAppearance: Appearance = "system";

export function isAppearance(value: unknown): value is Appearance {
  return appearances.some((appearance) => appearance === value);
}

const prefersDark = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const setCookie = (name: string, value: string, days = 365): void => {
  if (typeof document === "undefined") {
    return;
  }

  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const getStoredAppearance = (): Appearance => {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = localStorage.getItem("appearance");

  return isAppearance(stored) ? stored : "system";
};

const isDarkMode = (appearance: Appearance): boolean => {
  return appearance === "dark" || (appearance === "system" && prefersDark());
};

const getSystemAppearance = (): ResolvedAppearance => (prefersDark() ? "dark" : "light");

const applyAppearance = (appearance: Appearance): void => {
  if (typeof document === "undefined") {
    return;
  }

  const isDark = isDarkMode(appearance);

  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
};

const subscribe = (callback: () => void) => {
  listeners.add(callback);

  return () => listeners.delete(callback);
};

const notify = (): void => listeners.forEach((listener) => listener());

const mediaQuery = (): MediaQueryList | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.matchMedia("(prefers-color-scheme: dark)");
};

const handleSystemAppearanceChange = (): void => {
  applyAppearance(currentAppearance);
  notify();
};

export function updateAppearance(mode: Appearance): void {
  currentAppearance = mode;

  localStorage.setItem("appearance", mode);

  setCookie("appearance", mode);

  applyAppearance(mode);
  notify();
}

export function initializeAppearance(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!localStorage.getItem("appearance")) {
    localStorage.setItem("appearance", "system");
    setCookie("appearance", "system");
  }

  currentAppearance = getStoredAppearance();
  applyAppearance(currentAppearance);

  mediaQuery()?.addEventListener("change", handleSystemAppearanceChange);
}

export function useAppearance(): UseAppearanceReturn {
  const appearance: Appearance = useSyncExternalStore(
    subscribe,
    () => currentAppearance,
    () => "system",
  );
  const systemAppearance: ResolvedAppearance = useSyncExternalStore(
    subscribe,
    getSystemAppearance,
    () => "light",
  );

  const resolvedAppearance: ResolvedAppearance =
    appearance === "system" ? systemAppearance : appearance;

  return { appearance, resolvedAppearance, updateAppearance } as const;
}
