import { useEffect } from "react";
import { onToast as subscribeToToasts } from "@lattice-php/lattice/toast";
import type { ToastMessage } from "@lattice-php/lattice/toast";
import { useWindowEvent } from "@lattice-php/lattice/core/hooks/use-window-event";
import { isAppearance, type Appearance } from "./appearance";
import { LATTICE_EVENT } from "./core/event-names";

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

export function EventBridge({ onAppearanceChange, onLocaleChange, onToast }: EventBridgeProps) {
  useEffect(() => {
    if (!onToast) {
      return;
    }

    return subscribeToToasts(onToast);
  }, [onToast]);

  useWindowEvent(
    LATTICE_EVENT.appearanceChange,
    (event) => {
      const value = (event as AppearanceEvent).detail?.value;

      if (isAppearance(value)) {
        onAppearanceChange?.(value);
      }
    },
    { enabled: Boolean(onAppearanceChange) },
  );

  useWindowEvent(
    LATTICE_EVENT.localeChange,
    (event) => {
      const locale = (event as LocaleEvent).detail?.locale;

      if (typeof locale === "string" && locale !== "") {
        onLocaleChange?.(locale);
      }
    },
    { enabled: Boolean(onLocaleChange) },
  );

  return null;
}
