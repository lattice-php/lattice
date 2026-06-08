import { router } from "@inertiajs/react";

export type ActionEffect =
  | {
      message?: string;
      type: "toast";
      variant?: "success" | "info" | "warning" | "error";
    }
  | {
      type: "reloadPage";
    }
  | {
      component?: string;
      type: "reloadComponent";
    }
  | {
      modal?: string;
      type: "openModal";
    }
  | {
      modal?: string;
      type: "closeModal";
    };

const eventNames = {
  closeModal: "lattice:close-modal",
  openModal: "lattice:open-modal",
  reloadComponent: "lattice:reload-component",
  reloadPage: "lattice:reload-page",
  toast: "lattice:toast",
} satisfies Record<ActionEffect["type"], string>;

export function dispatchActionEffects(effects: ActionEffect[]): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const effect of effects) {
    if (effect.type === "reloadPage") {
      router.reload();
    }

    window.dispatchEvent(new CustomEvent(eventNames[effect.type], { detail: effect }));
  }
}

export function dispatchActionError(error: unknown): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("lattice:action-error", { detail: { error } }));
}

export function isActionEffect(effect: unknown): effect is ActionEffect {
  if (typeof effect !== "object" || effect === null || !("type" in effect)) {
    return false;
  }

  return (
    effect.type === "toast" ||
    effect.type === "reloadPage" ||
    effect.type === "reloadComponent" ||
    effect.type === "openModal" ||
    effect.type === "closeModal"
  );
}
