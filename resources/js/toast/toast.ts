import type { Toast as ToastMessage, Variant } from "@lattice-php/lattice/types/generated";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { isTranslatable } from "@lattice-php/lattice/i18n/translatable";

export type { ToastMessage, Variant };

const variants = [
  "primary",
  "secondary",
  "success",
  "info",
  "warning",
  "danger",
] as const satisfies readonly Variant[];

export function isVariant(value: unknown): value is Variant {
  return variants.some((variant) => variant === value);
}

export function coerceMessage(value: unknown): ToastMessage["message"] | null {
  const message = typeof value === "string" ? value : isTranslatable(value) ? value : null;

  return message === "" ? null : message;
}

export function subscribeWindowEvent<T>(
  event: string,
  normalize: (detail: unknown) => T | null,
  callback: (value: T) => void,
): () => void {
  const listener = (windowEvent: Event): void => {
    const value = normalize((windowEvent as CustomEvent).detail);

    if (value !== null) {
      callback(value);
    }
  };

  window.addEventListener(event, listener);

  return () => window.removeEventListener(event, listener);
}

export function normalizeToastMessage(value: unknown): ToastMessage | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const toast = value as Record<string, unknown>;
  const message = coerceMessage(toast.message);

  if (message === null) {
    return null;
  }

  return {
    action: (toast.action as ToastMessage["action"]) ?? null,
    dismissible: toast.dismissible !== false,
    duration: typeof toast.duration === "number" ? toast.duration : null,
    message,
    persistent: toast.persistent === true,
    variant: isVariant(toast.variant) ? toast.variant : "success",
  };
}

export function onToast(callback: (toast: ToastMessage) => void): () => void {
  return subscribeWindowEvent(LATTICE_EVENT.toast, normalizeToastMessage, callback);
}
