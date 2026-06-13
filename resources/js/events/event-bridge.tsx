import { useEffect } from "react";
import { onToast as subscribeToToasts } from "@lattice-php/lattice/toast/toast";
import type { ToastMessage } from "@lattice-php/lattice/toast/toast";
import { LATTICE_EVENT } from "./event-names";

export const appearances = ["light", "dark", "system"] as const;

export type Appearance = (typeof appearances)[number];

type EventBridgeProps = {
  onAppearanceChange?: (appearance: Appearance) => void;
  onToast?: (toast: ToastMessage) => void;
};

type AppearanceEvent = CustomEvent<{
  value?: unknown;
}>;

function isAppearance(value: unknown): value is Appearance {
  return appearances.some((appearance) => appearance === value);
}

export function EventBridge({ onAppearanceChange, onToast }: EventBridgeProps) {
  useEffect(() => {
    if (!onToast) {
      return;
    }

    return subscribeToToasts(onToast);
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
