import { router } from "@inertiajs/react";
import type { ResolveProps } from "@lattice-php/lattice/core/types";
import type { Effect, EffectPropsMap } from "@lattice-php/lattice/types/generated";
import { LATTICE_EVENT } from "@lattice-php/lattice/core/event-names";
import { setLocale } from "@lattice-php/lattice/i18n/locale";

/**
 * Consumer apps augment this via `declare module "@lattice-php/lattice"` to type
 * their custom effects' payloads; built-ins resolve through `EffectPropsMap`. The
 * effect counterpart of `ComponentProps`.
 */
export interface EffectProps {}

export type EffectPropsOf<TType extends string> = ResolveProps<
  EffectProps,
  EffectPropsMap,
  TType,
  Record<string, unknown>
>;

export type EffectOf<TType extends string> = string extends TType
  ? Effect
  : { type: TType; props: EffectPropsOf<TType> };

export type EffectHandler<TType extends string = string> = (effect: EffectOf<TType>) => void;

export type EffectHandlerRegistry = Record<string, EffectHandler>;

export type EffectHandlerRegistryFor<TTypes extends keyof EffectPropsMap & string> = Record<
  TTypes,
  EffectHandler
>;

/**
 * Author a handler against `EffectHandler<"my.type">` for a typed payload, then
 * register it through this — it erases the type parameter for the loose registry.
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

function bridge<TType extends keyof EffectPropsMap & string>(event: string): EffectHandler<TType> {
  return (effect) => window.dispatchEvent(new CustomEvent(event, { detail: effect.props }));
}

/**
 * Imperative effects act directly; the rest bridge to the `lattice:*` DOM events
 * that toast/callout/modal/fragment/form subscribe to. The mapped type keeps
 * every handler's payload checked against the generated EffectPropsMap; the
 * export erases to the loose registry shape like effectHandler does.
 */
const typedBuiltinHandlers: { [K in keyof EffectPropsMap]: EffectHandler<K> } = {
  "reload-page": () => router.reload(),
  redirect: (effect) => router.visit(effect.props.url),
  download: (effect) => triggerDownload(effect.props.url),
  "locale-change": (effect) => setLocale(effect.props.locale),
  toast: bridge<"toast">(LATTICE_EVENT.toast),
  callout: bridge<"callout">(LATTICE_EVENT.callout),
  "reload-component": bridge<"reload-component">(LATTICE_EVENT.reloadComponent),
  "open-modal": bridge<"open-modal">(LATTICE_EVENT.openModal),
  "close-modal": bridge<"close-modal">(LATTICE_EVENT.closeModal),
  "reset-form": bridge<"reset-form">(LATTICE_EVENT.resetForm),
  "toggle-sidebar": bridge<"toggle-sidebar">(LATTICE_EVENT.toggleSidebar),
};

export const builtinEffectHandlers: EffectHandlerRegistryFor<keyof EffectPropsMap & string> =
  typedBuiltinHandlers as EffectHandlerRegistryFor<keyof EffectPropsMap & string>;

export function mergeEffectHandlers(
  ...registries: Array<EffectHandlerRegistry | undefined>
): EffectHandlerRegistry {
  return registries.reduce<EffectHandlerRegistry>(
    (merged, registry) => ({ ...merged, ...registry }),
    {},
  );
}
