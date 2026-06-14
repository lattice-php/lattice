import { useCallback } from "react";
import { useEffectHandlers } from "@lattice-php/lattice/provider";
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

  return useCallback(
    (effects: ActionEffect[]) =>
      dispatchEffects(effects, mergeEffectHandlers(builtinEffectHandlers, registered)),
    [registered],
  );
}
