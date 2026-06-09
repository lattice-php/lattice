import { router } from "@inertiajs/react";
import { useEffect } from "react";
import { LATTICE_EVENT } from "./event-names";

export const toastVariants = ["success", "info", "warning", "error"] as const;
export const appearances = ["light", "dark", "system"] as const;

export type ToastVariant = (typeof toastVariants)[number];
export type Appearance = (typeof appearances)[number];

export type ToastMessage = {
  message: string;
  variant: ToastVariant;
};

type EventBridgeProps = {
  onAppearanceChange?: (appearance: Appearance) => void;
  onToast?: (toast: ToastMessage) => void;
};

type ToastEvent = CustomEvent<{
  message?: unknown;
  variant?: unknown;
}>;

type AppearanceEvent = CustomEvent<{
  value?: unknown;
}>;

type InertiaFlashEvent = CustomEvent<{
  flash?: {
    toast?: unknown;
  };
}>;

function isToastVariant(value: unknown): value is ToastVariant {
  return toastVariants.some((variant) => variant === value);
}

function isAppearance(value: unknown): value is Appearance {
  return appearances.some((appearance) => appearance === value);
}

function normalizeFlashToast(value: unknown): ToastMessage | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Partial<ToastMessage>;

  if (typeof candidate.message !== "string" || !isToastVariant(candidate.variant)) {
    return null;
  }

  return {
    message: candidate.message,
    variant: candidate.variant,
  };
}

function normalizeLatticeToast(event: Event): ToastMessage | null {
  const detail = (event as ToastEvent).detail;
  const message = detail?.message;

  if (typeof message !== "string" || message === "") {
    return null;
  }

  return {
    message,
    variant: isToastVariant(detail.variant) ? detail.variant : "success",
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

    window.addEventListener(LATTICE_EVENT.toast, listener);

    return () => {
      window.removeEventListener(LATTICE_EVENT.toast, listener);
    };
  }, [onToast]);

  useEffect(() => {
    if (!onAppearanceChange) {
      return;
    }

    const listener = (event: Event): void => {
      const value = (event as AppearanceEvent).detail?.value;

      if (isAppearance(value)) {
        onAppearanceChange(value);
      }
    };

    window.addEventListener(LATTICE_EVENT.appearanceChange, listener);

    return () => {
      window.removeEventListener(LATTICE_EVENT.appearanceChange, listener);
    };
  }, [onAppearanceChange]);

  return null;
}
