import type { I18nConfig } from "@lattice-php/lattice/types/generated";
import { useSyncExternalStore } from "react";

export type Config = {
  readonly locales: readonly string[];
  readonly timezone: string | null;
};

const fallback: Config = { locales: [], timezone: null };
const listeners = new Set<() => void>();

let active: Config = fallback;

function normalizeLocales(locales: readonly string[] | undefined): string[] {
  return Array.from(new Set((locales ?? []).map((locale) => locale.trim()).filter(Boolean)));
}

function sameLocales(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((locale, index) => locale === right[index]);
}

function snapshot(): Config {
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

export function setConfig(config: I18nConfig | undefined): void {
  const locales = normalizeLocales(config?.locales);
  const timezone = config?.timezone ?? null;

  if (sameLocales(active.locales, locales) && active.timezone === timezone) {
    return;
  }

  active = { locales, timezone };
  notify();
}

export function activeTimezoneForTest(): string | null {
  return active.timezone;
}

export function useConfig(): Config {
  return useSyncExternalStore(subscribe, snapshot, () => fallback);
}
