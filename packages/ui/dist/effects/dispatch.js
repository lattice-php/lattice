import { builtinEffectHandlers } from "./registry.js";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
//#region resources/js/effects/dispatch.ts
/**
* Run each effect through its handler. Handlers default to the built-ins; the
* Provider passes a merged registry that also includes consumer-registered
* handlers. An effect with no handler is warned about (dev) and skipped.
*/
function dispatchEffects(effects, handlers = builtinEffectHandlers) {
	if (typeof window === "undefined") return;
	for (const effect of effects) {
		const handler = handlers[effect.type];
		if (handler === void 0) {
			console.warn(`[lattice] No handler registered for effect type "${effect.type}".`);
			continue;
		}
		handler(effect);
	}
}
function dispatchActionError(error) {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent(LATTICE_EVENT.actionError, { detail: { error } }));
}
function getActionEffects(effects) {
	return Array.isArray(effects) ? effects.filter(isActionEffect) : [];
}
/**
* Structural guard for an effect on the wire. Intentionally open: it accepts any
* object with a string `type`, not only the built-in types, so consumer-registered
* effects pass through getActionEffects() and reach their handlers. Dispatch warns
* on (and skips) a type with no registered handler.
*/
function isActionEffect(effect) {
	return typeof effect === "object" && effect !== null && "type" in effect && typeof effect.type === "string";
}
//#endregion
export { dispatchActionError, dispatchEffects, getActionEffects, isActionEffect };

//# sourceMappingURL=dispatch.js.map