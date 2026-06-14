import { useEffect } from "react";
import { onToast as subscribeToToasts } from "@lattice-php/lattice/toast/toast";
import type { ToastMessage } from "@lattice-php/lattice/toast/toast";
import { LATTICE_EVENT } from "./event-names";

export const appearances = ["light", "dark", "system"] as const;

export type Appearance = (typeof appearances)[number];

type EventBridgeProps = {
  onAppearanceChange?: (appearance: Appearance) => void;
  onLocaleChange?: (locale: string) => void;
  onToast?: (toast: ToastMessage) => void;
};

type AppearanceEvent = CustomEvent<{
  value?: unknown;
}>;

type LocaleEvent = CustomEvent<{
  locale?: unknown;
}>;

function isAppearance(value: unknown): value is Appearance {
  return appearances.some((appearance) => appearance === value);
}

export function EventBridge({ onAppearanceChange, onLocaleChange, onToast }: EventBridgeProps) {
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

  useEffect(() => {
    if (!onLocaleChange) {
      return;
    }

    const listener = (event: Event): void => {
      const locale = (event as LocaleEvent).detail?.locale;

      if (typeof locale === "string" && locale !== "") {
        onLocaleChange(locale);
      }
    };

    window.addEventListener(LATTICE_EVENT.localeChange, listener);

    return () => {
      window.removeEventListener(LATTICE_EVENT.localeChange, listener);
    };
  }, [onLocaleChange]);

  return null;
}
