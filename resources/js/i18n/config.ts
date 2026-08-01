import type { I18nConfig } from "@lattice-php/lattice/types/generated";
import { useSyncExternalStore } from "react";
import { createListeners } from "@lattice-php/lattice/lib/listeners";

type Config = {
  readonly locales: readonly string[];
  readonly timezone: string | null;
};

const fallback: Config = { locales: [], timezone: null };
const { subscribe, notify } = createListeners();

let active: Config = fallback;

function normalizeLocales(locales: readonly string[] | undefined): string[] {
  return Array.from(new Set((locales ?? []).map((locale) => locale.trim()).filter(Boolean)));
}

function snapshot(): Config {
  return active;
}

export const subscribeConfig = subscribe;

export function setConfig(config: I18nConfig | undefined): void {
  const locales = normalizeLocales(config?.locales);
  const timezone = config?.timezone ?? null;

  if (active.locales.join("") === locales.join("") && active.timezone === timezone) {
    return;
  }

  active = { locales, timezone };
  notify();
}

export function configTimezone(): string | null {
  return active.timezone;
}

export function useConfig(): Config {
  return useSyncExternalStore(subscribeConfig, snapshot, () => fallback);
}
