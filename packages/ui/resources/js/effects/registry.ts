import type { EffectOf, EffectProps, EffectPropsMap, EffectPropsOf } from "./types";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { useExtensionRegistry } from "@lattice-php/core/registry-context";
import { setLocale } from "../i18n/locale";

export type { EffectOf, EffectProps, EffectPropsOf };

export type EffectHandler<TType extends string = string> = (effect: EffectOf<TType>) => void;

export type EffectHandlerRegistry = Record<string, EffectHandler>;

export const EFFECT_HANDLER_REGISTRY_EXTENSION = "effects";

export function useEffectHandlerRegistry(): EffectHandlerRegistry {
  return useExtensionRegistry<EffectHandlerRegistry>(EFFECT_HANDLER_REGISTRY_EXTENSION);
}

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
 * that toast/callout/modal/fragment/form subscribe to. The export cast erases
 * the mapped type to the loose registry shape — the same variance erasure
 * effectHandler performs.
 */
const typedBuiltinHandlers: { [K in keyof EffectPropsMap]: EffectHandler<K> } = {
  // Full-page defaults; the framework registry overrides both with SPA
  // handlers via the effects extension.
  "reload-page": () => window.location.reload(),
  redirect: (effect) => window.location.assign(effect.props.url),
  download: (effect) => triggerDownload(effect.props.url),
  "locale-change": (effect) => setLocale(effect.props.locale),
  toast: bridge<"toast">(LATTICE_EVENT.toast),
  callout: bridge<"callout">(LATTICE_EVENT.callout),
  "retract-callout": bridge<"retract-callout">(LATTICE_EVENT.retractCallout),
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
  return Object.assign({}, ...registries);
}
