import { useWindowEvent } from "@lattice-php/core/hooks/use-window-event";
import { isAppearance, type Appearance } from "./appearance";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";

type EventBridgeProps = {
  onAppearanceChange?: (appearance: Appearance) => void;
};

type AppearanceEvent = CustomEvent<{
  value?: unknown;
}>;

export function EventBridge({ onAppearanceChange }: EventBridgeProps) {
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

  return null;
}
