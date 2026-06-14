import { router } from "@inertiajs/react";
import type { Effect } from "@lattice-php/lattice/types/generated";
import { LATTICE_EVENT } from "@lattice-php/lattice/events/event-names";
import { setLocale } from "@lattice-php/lattice/i18n/locale";

export type EffectHandler = (effect: Effect) => void;
export type EffectHandlerRegistry = Record<string, EffectHandler>;

function triggerDownload(url: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/** Re-broadcast an effect as its `lattice:*` DOM event for feature components. */
function bridge(event: string): EffectHandler {
  return (effect) => window.dispatchEvent(new CustomEvent(event, { detail: effect }));
}

/**
 * Built-in effect handlers. Imperative effects act directly; the rest bridge to
 * the `lattice:*` DOM events that toast/callout/modal/fragment/form subscribe to
 * — preserving today's behavior exactly.
 */
export const builtinEffectHandlers: EffectHandlerRegistry = {
  reloadPage: () => router.reload(),
  redirect: (effect) => router.visit((effect as Extract<Effect, { type: "redirect" }>).url),
  download: (effect) => triggerDownload((effect as Extract<Effect, { type: "download" }>).url),
  localeChange: (effect) => setLocale((effect as Extract<Effect, { type: "localeChange" }>).locale),
  toast: bridge(LATTICE_EVENT.toast),
  callout: bridge(LATTICE_EVENT.callout),
  reloadComponent: bridge(LATTICE_EVENT.reloadComponent),
  openModal: bridge(LATTICE_EVENT.openModal),
  closeModal: bridge(LATTICE_EVENT.closeModal),
  resetForm: bridge(LATTICE_EVENT.resetForm),
};

export function mergeEffectHandlers(
  ...registries: Array<EffectHandlerRegistry | undefined>
): EffectHandlerRegistry {
  return registries.reduce<EffectHandlerRegistry>(
    (merged, registry) => ({ ...merged, ...registry }),
    {},
  );
}
