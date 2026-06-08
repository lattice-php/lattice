import { router } from "@inertiajs/react";
import { useEffect } from "react";

export const toastTypes = ["success", "info", "warning", "error"] as const;
export const appearances = ["light", "dark", "system"] as const;

export type ToastType = (typeof toastTypes)[number];
export type LatticeAppearance = (typeof appearances)[number];

export type ToastMessage = {
  message: string;
  type: ToastType;
};

type EventBridgeProps = {
  onAppearanceChange?: (appearance: LatticeAppearance) => void;
  onToast?: (toast: ToastMessage) => void;
};

type LatticeToastEvent = CustomEvent<{
  message?: unknown;
  variant?: unknown;
}>;

type LatticeAppearanceEvent = CustomEvent<{
  value?: unknown;
}>;

type InertiaFlashEvent = CustomEvent<{
  flash?: {
    toast?: unknown;
  };
}>;

function isToastType(value: unknown): value is ToastType {
  return toastTypes.some((type) => type === value);
}

function isAppearance(value: unknown): value is LatticeAppearance {
  return appearances.some((appearance) => appearance === value);
}

function normalizeFlashToast(value: unknown): ToastMessage | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Partial<ToastMessage>;

  if (typeof candidate.message !== "string" || !isToastType(candidate.type)) {
    return null;
  }

  return {
    message: candidate.message,
    type: candidate.type,
  };
}

function normalizeLatticeToast(event: Event): ToastMessage | null {
  const detail = (event as LatticeToastEvent).detail;
  const message = detail?.message;

  if (typeof message !== "string" || message === "") {
    return null;
  }

  return {
    message,
    type: isToastType(detail.variant) ? detail.variant : "success",
  };
}

export function EventBridge({ onAppearanceChange, onToast }: EventBridgeProps) {
  useEffect(() => {
    if (!onToast) {
      return;
    }

    return router.on("flash", (event) => {
      const toast = normalizeFlashToast((event as InertiaFlashEvent).detail?.flash?.toast);

      if (toast) {
        onToast(toast);
      }
    });
  }, [onToast]);

  useEffect(() => {
    if (!onToast) {
      return;
    }

    const listener = (event: Event): void => {
      const toast = normalizeLatticeToast(event);

      if (toast) {
        onToast(toast);
      }
    };

    window.addEventListener("lattice:toast", listener);

    return () => {
      window.removeEventListener("lattice:toast", listener);
    };
  }, [onToast]);

  useEffect(() => {
    if (!onAppearanceChange) {
      return;
    }

    const listener = (event: Event): void => {
      const value = (event as LatticeAppearanceEvent).detail?.value;

      if (isAppearance(value)) {
        onAppearanceChange(value);
      }
    };

    window.addEventListener("lattice:appearance-change", listener);

    return () => {
      window.removeEventListener("lattice:appearance-change", listener);
    };
  }, [onAppearanceChange]);

  return null;
}
