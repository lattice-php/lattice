import type { Callout } from "@lattice-php/lattice/types/generated";
import { LATTICE_EVENT } from "@lattice-php/lattice/events/event-names";
import { isVariant } from "./toast";

export type { Callout };

export function normalizeCallout(detail: unknown): Callout | null {
  if (typeof detail !== "object" || detail === null) {
    return null;
  }

  const callout = detail as Record<string, unknown>;

  if (typeof callout.message !== "string" || callout.message === "") {
    return null;
  }

  return {
    action: (callout.action as Callout["action"]) ?? null,
    dismissible: callout.dismissible !== false,
    message: callout.message,
    title: typeof callout.title === "string" ? callout.title : null,
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
