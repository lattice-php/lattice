import type { ReactNode } from "react";
import type { Registry } from "./core/registry";
import { RegistryContext } from "./core/registry-context";
import { useFlashEffects } from "./effects/use-flash-effects";
import { EventBridge } from "./events/event-bridge";
import type { SpriteValue } from "./icons/sprite";
import { SpriteProvider } from "./icons/sprite";
import { Toaster } from "./toast";
import { updateAppearance } from "./appearance";

const defaultSprite: SpriteValue = { href: "" };

export type ProviderBaseProps = {
  children: ReactNode;
  registry: Registry;
  sprite?: SpriteValue;
  toaster?: boolean;
};

export function ProviderBase({
  children,
  registry,
  sprite = defaultSprite,
  toaster = true,
}: ProviderBaseProps) {
  useFlashEffects();

  return (
    <RegistryContext.Provider value={registry}>
      <SpriteProvider sprite={sprite}>
        {children}
        <EventBridge onAppearanceChange={updateAppearance} />
        {toaster ? <Toaster /> : null}
      </SpriteProvider>
    </RegistryContext.Provider>
  );
}
