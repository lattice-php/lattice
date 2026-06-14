import { router } from "@inertiajs/react";
import { useEffect } from "react";
import { getActionEffects } from "@lattice-php/lattice/effects/dispatch";
import { useEffectDispatcher } from "@lattice-php/lattice/effects/use-effect-dispatcher";

type InertiaFlashEvent = CustomEvent<{
  flash?: {
    latticeEffects?: unknown;
  };
}>;

/**
 * Drains the `latticeEffects` flash bag (server `Effects::flash(...)`) on each
 * Inertia navigation and runs the effects through the registry dispatcher.
 */
export function useFlashEffects(): void {
  const dispatch = useEffectDispatcher();

  useEffect(() => {
    return router.on("flash", (event) => {
      const effects = getActionEffects((event as InertiaFlashEvent).detail?.flash?.latticeEffects);

      if (effects.length > 0) {
        dispatch(effects);
      }
    });
  }, [dispatch]);
}
