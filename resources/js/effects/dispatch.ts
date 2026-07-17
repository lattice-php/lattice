import type { ActionResult, Effect } from "@lattice-php/lattice/types/generated";
import { LATTICE_EVENT } from "@lattice-php/lattice/core/event-names";
import { builtinEffectHandlers } from "./registry";
import type { EffectHandlerRegistry } from "./registry";

export type ActionEffect = Effect;

export type ActionResponse = Partial<ActionResult>;

/**
 * Run each effect through its handler. Handlers default to the built-ins; the
 * Provider passes a merged registry that also includes consumer-registered
 * handlers. An effect with no handler is warned about (dev) and skipped.
 */
export function dispatchEffects(
  effects: ActionEffect[],
  handlers: EffectHandlerRegistry = builtinEffectHandlers,
): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const effect of effects) {
    const handler = handlers[effect.type];

    if (handler === undefined) {
      console.warn(`[lattice] No handler registered for effect type "${effect.type}".`);
      continue;
    }

    handler(effect);
  }
}

export function dispatchActionError(error: unknown): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(LATTICE_EVENT.actionError, { detail: { error } }));
}

export function getActionEffects(effects: unknown): ActionEffect[] {
  return Array.isArray(effects) ? effects.filter(isActionEffect) : [];
}

/**
 * Structural guard for an effect on the wire. Intentionally open: it accepts any
 * object with a string `type`, not only the built-in types, so consumer-registered
 * effects pass through getActionEffects() and reach their handlers. Dispatch warns
 * on (and skips) a type with no registered handler.
 */
export function isActionEffect(effect: unknown): effect is ActionEffect {
  return (
    typeof effect === "object" &&
    effect !== null &&
    "type" in effect &&
    typeof (effect as { type: unknown }).type === "string"
  );
}
