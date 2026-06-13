import { router } from "@inertiajs/react";
import { useEffect } from "react";
import { normalizeToastMessage, showToast } from "@lattice-php/lattice/toast/toast";

type InertiaFlashEvent = CustomEvent<{
  flash?: {
    toast?: unknown;
  };
}>;

/**
 * Funnels Laravel flash toasts (`Inertia::flash('toast', ...)`) onto the shared
 * `lattice:toast` bus so the built-in Toaster and any consumer subscriber render
 * them through the same pipeline as action effects.
 */
export function useFlashToasts(): void {
  useEffect(() => {
    return router.on("flash", (event) => {
      const toast = normalizeToastMessage((event as InertiaFlashEvent).detail?.flash?.toast);

      if (toast) {
        showToast(toast);
      }
    });
  }, []);
}
