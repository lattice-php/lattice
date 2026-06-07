export type LatticeActionEffect =
  | {
      message?: string;
      type: "toast";
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
  toast: "lattice:toast",
} satisfies Record<LatticeActionEffect["type"], string>;

export function dispatchActionEffects(effects: LatticeActionEffect[]): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const effect of effects) {
    window.dispatchEvent(new CustomEvent(eventNames[effect.type], { detail: effect }));
  }
}

export function dispatchActionError(error: unknown): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("lattice:action-error", { detail: { error } }));
}

export function isActionEffect(effect: unknown): effect is LatticeActionEffect {
  if (typeof effect !== "object" || effect === null || !("type" in effect)) {
    return false;
  }

  return (
    effect.type === "toast" ||
    effect.type === "reloadComponent" ||
    effect.type === "openModal" ||
    effect.type === "closeModal"
  );
}
