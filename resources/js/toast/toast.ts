import type { Toast as ToastMessage, Variant } from "@lattice-php/lattice/types/generated";
import { LATTICE_EVENT } from "@lattice-php/lattice/core/event-names";
import { isTranslatable } from "@lattice-php/lattice/i18n/translatable";

export type { ToastMessage, Variant };

const variants = ["success", "info", "warning", "danger"] as const satisfies readonly Variant[];

export function isVariant(value: unknown): value is Variant {
  return variants.some((variant) => variant === value);
}

export function normalizeToastMessage(value: unknown): ToastMessage | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const toast = value as Record<string, unknown>;

  const rawMessage = toast.message;
  const message =
    typeof rawMessage === "string" ? rawMessage : isTranslatable(rawMessage) ? rawMessage : null;

  if (message === null || message === "") {
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
  const listener = (event: Event): void => {
    const toast = normalizeToastMessage((event as CustomEvent).detail);

    if (toast) {
      callback(toast);
    }
  };

  window.addEventListener(LATTICE_EVENT.toast, listener);

  return () => window.removeEventListener(LATTICE_EVENT.toast, listener);
}
