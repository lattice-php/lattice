import { builtinEffectHandlers, mergeEffectHandlers, useEffectHandlerRegistry } from "./registry.js";
import { dispatchEffects } from "./dispatch.js";
import { useCallback, useMemo } from "react";
//#region resources/js/effects/use-effect-dispatcher.ts
/**
* Returns a dispatcher bound to the built-in handlers plus any consumer handlers
* in the current registry. The built-ins are merged in directly so they fire even
* with no <Provider> in scope (effects are infrastructural) — this is the single
* place built-ins enter dispatch.
*/
function useEffectDispatcher() {
	const registered = useEffectHandlerRegistry();
	const handlers = useMemo(() => mergeEffectHandlers(builtinEffectHandlers, registered), [registered]);
	return useCallback((effects) => dispatchEffects(effects, handlers), [handlers]);
}
//#endregion
export { useEffectDispatcher };

//# sourceMappingURL=use-effect-dispatcher.js.map