import { useCallback, useMemo } from "react";
import { useEffectHandlerRegistry } from "@lattice-php/lattice/core/registry-context";
import { dispatchEffects } from "./dispatch";
import type { ActionEffect } from "./dispatch";
import { builtinEffectHandlers, mergeEffectHandlers } from "./registry";

/**
 * Returns a dispatcher bound to the built-in handlers plus any consumer handlers
 * in the current registry. The built-ins are merged in directly so they fire even
 * with no <Provider> in scope (effects are infrastructural) — this is the single
 * place built-ins enter dispatch.
 */
export function useEffectDispatcher(): (effects: ActionEffect[]) => void {
  const registered = useEffectHandlerRegistry();

  const handlers = useMemo(
    () => mergeEffectHandlers(builtinEffectHandlers, registered),
    [registered],
  );

  return useCallback((effects: ActionEffect[]) => dispatchEffects(effects, handlers), [handlers]);
}
