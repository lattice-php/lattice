import { router } from "@inertiajs/react";
import type { ResolveProps } from "@lattice-php/lattice/core/types";
import type { Effect, EffectPropsMap } from "@lattice-php/lattice/types/generated";
import { LATTICE_EVENT } from "@lattice-php/lattice/events/event-names";
import { setLocale } from "@lattice-php/lattice/i18n/locale";

/**
 * Augmentable map of effect `type` → payload (the effect's fields minus `type`).
 * Consumer apps extend it via `declare module "@lattice-php/lattice"` so their
 * custom effects type their handler's payload; built-ins resolve through the
 * generated `EffectPropsMap`, the same way `ComponentProps` augments
 * `ComponentPropsMap` — one augmentable-map pattern.
 */
export interface EffectProps {}

type EffectPayloadOf<TType extends string> = ResolveProps<
  EffectProps,
  EffectPropsMap,
  TType,
  Record<string, unknown>
>;

/**
 * Resolves an effect `type` to its full shape — `{ type, ...payload }` — the way
 * `Node<T>` pairs a type with its props, so built-ins and consumer effects alike
 * always carry `type`. An unknown type falls back to the loose `Effect` union.
 */
export type EffectOf<TType extends string> = string extends TType
  ? Effect
  : { type: TType } & EffectPayloadOf<TType>;

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
  return fn as unknown as EffectHandler;
}

function triggerDownload(url: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

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
  toggleSidebar: bridge(LATTICE_EVENT.toggleSidebar),
};

export function mergeEffectHandlers(
  ...registries: Array<EffectHandlerRegistry | undefined>
): EffectHandlerRegistry {
  return registries.reduce<EffectHandlerRegistry>(
    (merged, registry) => ({ ...merged, ...registry }),
    {},
  );
}
