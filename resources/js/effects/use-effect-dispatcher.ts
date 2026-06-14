import { useCallback, useMemo } from "react";
import { useEffectHandlers } from "@lattice-php/lattice/core/registry-context";
import { dispatchEffects } from "./dispatch";
import type { ActionEffect } from "./dispatch";
import { mergeEffectHandlers, builtinEffectHandlers } from "./registry";

/**
 * Returns a dispatcher bound to the effect handlers in the current registry
 * (built-ins plus any consumer-registered handlers). Use from components and
 * hooks that run inside <Provider>.
 */
export function useEffectDispatcher(): (effects: ActionEffect[]) => void {
  const registered = useEffectHandlers();

  // Built-ins are merged in directly so they always fire, even if a consumer
  // supplies a registry that doesn't extend the default (where the effects plugin
  // would otherwise provide them). Re-merging registry handlers is idempotent.
  const handlers = useMemo(
    () => mergeEffectHandlers(builtinEffectHandlers, registered),
    [registered],
  );

  return useCallback((effects: ActionEffect[]) => dispatchEffects(effects, handlers), [handlers]);
}
