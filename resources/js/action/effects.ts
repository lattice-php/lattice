import { router } from "@inertiajs/react";
import type { EffectType, ToastType } from "@lattice/generated/enums";

export type ActionEffect =
  | {
      message?: string;
      type: "toast";
      variant?: ToastType;
    }
  | {
      type: "reloadPage";
    }
  | {
      component?: string;
      type: "reloadComponent";
    }
  | {
      type: "redirect";
      url?: string;
    }
  | {
      type: "download";
      url?: string;
    }
  | {
      modal?: string;
      type: "openModal";
    }
  | {
      modal?: string;
      type: "closeModal";
    }
  | {
      form?: string;
      type: "resetForm";
    };

const eventNames = {
  closeModal: "lattice:close-modal",
  download: "lattice:download",
  openModal: "lattice:open-modal",
  redirect: "lattice:redirect",
  reloadComponent: "lattice:reload-component",
  reloadPage: "lattice:reload-page",
  resetForm: "lattice:reset-form",
  toast: "lattice:toast",
} satisfies Record<EffectType, string>;

function triggerDownload(url: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function dispatchActionEffects(effects: ActionEffect[]): void {
  if (typeof window === "undefined") {
    return;
  }

  for (const effect of effects) {
    if (effect.type === "reloadPage") {
      router.reload();
    }

    if (effect.type === "redirect" && typeof effect.url === "string") {
      router.visit(effect.url);
    }

    if (effect.type === "download" && typeof effect.url === "string") {
      triggerDownload(effect.url);
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

export function getActionEffects(effects: unknown): ActionEffect[] {
  return Array.isArray(effects) ? effects.filter(isActionEffect) : [];
}

export function isActionEffect(effect: unknown): effect is ActionEffect {
  return (
    typeof effect === "object" &&
    effect !== null &&
    "type" in effect &&
    typeof effect.type === "string" &&
    Object.hasOwn(eventNames, effect.type)
  );
}
