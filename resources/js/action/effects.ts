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
} satisfies Record<ActionEffect["type"], string>;

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

export function isActionEffect(effect: unknown): effect is ActionEffect {
  if (typeof effect !== "object" || effect === null || !("type" in effect)) {
    return false;
  }

  return (
    effect.type === "toast" ||
    effect.type === "reloadPage" ||
    effect.type === "reloadComponent" ||
    effect.type === "redirect" ||
    effect.type === "download" ||
    effect.type === "openModal" ||
    effect.type === "closeModal" ||
    effect.type === "resetForm"
  );
}
