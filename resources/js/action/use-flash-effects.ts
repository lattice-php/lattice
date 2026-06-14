import { router } from "@inertiajs/react";
import { useEffect } from "react";
import { dispatchActionEffects, getActionEffects } from "@lattice-php/lattice/action/effects";

type InertiaFlashEvent = CustomEvent<{
  flash?: {
    latticeEffects?: unknown;
  };
}>;

/**
 * Drains the `latticeEffects` flash bag (server `Effects::flash(...)`) on each
 * Inertia navigation and runs the effects through the same pipeline as
 * action-result effects.
 */
export function useFlashEffects(): void {
  useEffect(() => {
    return router.on("flash", (event) => {
      const effects = getActionEffects((event as InertiaFlashEvent).detail?.flash?.latticeEffects);

      if (effects.length > 0) {
        dispatchActionEffects(effects);
      }
    });
  }, []);
}
