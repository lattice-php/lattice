import { router } from "@inertiajs/react";
import type { ResolveProps } from "@lattice-php/lattice/core/types";
import type { Effect } from "@lattice-php/lattice/types/generated";
import { LATTICE_EVENT } from "@lattice-php/lattice/events/event-names";
import { setLocale } from "@lattice-php/lattice/i18n/locale";

/**
 * Augmentable map of effect `type` → effect shape. Consumer apps extend it via
 * `declare module "@lattice-php/lattice"` so their custom effects type their
 * handler's payload; built-ins resolve through the generated `Effect` union.
 */
export interface EffectProps {}

// The generated built-in effects, keyed by their `type` discriminant.
type EffectMap = { [TEffect in Effect as TEffect["type"]]: TEffect };

/**
 * Resolves an effect `type` to its shape: consumer augmentations (`EffectProps`)
 * first, then the generated built-ins, then the loose `Effect` union.
 */
export type EffectOf<TType extends string> = ResolveProps<EffectProps, EffectMap, TType, Effect>;

export type EffectHandler<TType extends string = string> = (effect: EffectOf<TType>) => void;

export type EffectHandlerRegistry = Record<string, EffectHandler>;

/**
 * Registers a typed effect handler, erasing the type parameter for the registry.
 * Mirrors `eagerComponent`/`columnCell`: author against `EffectHandler<"my.type">`
 * for a typed payload, register through this.
 */
export function effectHandler<TType extends string>(
  _type: TType,
  fn: EffectHandler<TType>,
): EffectHandler {
  return fn as EffectHandler;
}

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
  redirect: effectHandler("redirect", (effect) => router.visit(effect.url)),
  download: effectHandler("download", (effect) => triggerDownload(effect.url)),
  localeChange: effectHandler("localeChange", (effect) => setLocale(effect.locale)),
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
