import { useSyncExternalStore } from "react";
import { LATTICE_EVENT } from "@lattice-php/lattice/core/event-names";
import { configTimezone, subscribeConfig } from "./config";

export type UseTimezoneReturn = {
  readonly timezone: string;
  readonly setTimezone: (timezone: string) => void;
};

const fallback = "UTC";
const listeners = new Set<() => void>();

let override: string | undefined;

function detectedTimezone(): string {
  if (typeof Intl === "undefined") {
    return fallback;
  }

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || fallback;
  } catch {
    return fallback;
  }
}

function snapshot(): string {
  return override ?? configTimezone() ?? detectedTimezone();
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

subscribeConfig(() => notify());

function dispatch(timezone: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(LATTICE_EVENT.timezoneChange, { detail: { timezone } }));
}

export function currentTimezone(): string {
  return snapshot();
}

export function setTimezone(timezone: string): void {
  const previous = currentTimezone();
  const next = timezone.trim();

  override = next === "" ? undefined : next;

  if (currentTimezone() === previous) {
    return;
  }

  notify();
  dispatch(currentTimezone());
}

export function useTimezone(): UseTimezoneReturn {
  const timezone = useSyncExternalStore(subscribe, snapshot, () => fallback);

  return { timezone, setTimezone } as const;
}
