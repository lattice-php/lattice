import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import type { Callout, RetractCallout } from "../generated";
import { isTranslatable } from "../i18n/translatable";
import { coerceMessage, isVariant, subscribeWindowEvent } from "./bus";

export function normalizeCallout(detail: unknown): Callout | null {
  if (typeof detail !== "object" || detail === null) {
    return null;
  }

  const callout = detail as Record<string, unknown>;
  const message = coerceMessage(callout.message);

  if (message === null) {
    return null;
  }

  return {
    action: (callout.action as Callout["action"]) ?? null,
    dismissible: callout.dismissible !== false,
    message,
    title:
      typeof callout.title === "string" || isTranslatable(callout.title) ? callout.title : null,
    unique: typeof callout.unique === "string" ? callout.unique : null,
    variant: isVariant(callout.variant) ? callout.variant : "info",
  };
}

export function onCallout(callback: (callout: Callout) => void): () => void {
  return subscribeWindowEvent(LATTICE_EVENT.callout, normalizeCallout, callback);
}

export function onRetractCallout(callback: (unique: string) => void): () => void {
  return subscribeWindowEvent(
    LATTICE_EVENT.retractCallout,
    (detail) => {
      const unique = (detail as RetractCallout | undefined)?.unique;

      return typeof unique === "string" ? unique : null;
    },
    callback,
  );
}
