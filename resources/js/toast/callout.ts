import type { Callout } from "@lattice-php/lattice/types/generated";
import { LATTICE_EVENT } from "@lattice-php/lattice/core/event-names";
import { isTranslatable } from "@lattice-php/lattice/i18n/translatable";
import { isVariant } from "./toast";

export type { Callout };

export function normalizeCallout(detail: unknown): Callout | null {
  if (typeof detail !== "object" || detail === null) {
    return null;
  }

  const callout = detail as Record<string, unknown>;

  const rawMessage = callout.message;
  const message =
    typeof rawMessage === "string" ? rawMessage : isTranslatable(rawMessage) ? rawMessage : null;

  if (message === null || message === "") {
    return null;
  }

  return {
    action: (callout.action as Callout["action"]) ?? null,
    dismissible: callout.dismissible !== false,
    message,
    title:
      typeof callout.title === "string" || isTranslatable(callout.title) ? callout.title : null,
    variant: isVariant(callout.variant) ? callout.variant : "info",
  };
}

export function onCallout(callback: (callout: Callout) => void): () => void {
  const listener = (event: Event): void => {
    const callout = normalizeCallout((event as CustomEvent).detail);

    if (callout) {
      callback(callout);
    }
  };

  window.addEventListener(LATTICE_EVENT.callout, listener);

  return () => window.removeEventListener(LATTICE_EVENT.callout, listener);
}
