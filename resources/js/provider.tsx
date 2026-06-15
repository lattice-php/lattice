import type { ReactNode } from "react";
import type { SpriteValue } from "./icons/sprite";
import { SpriteProvider } from "./icons/sprite";
import { registry as defaultRegistry } from "./registry";
import type { Registry } from "./core/registry";
import { RegistryContext, setDefaultRegistry } from "./core/registry-context";
import { Toaster } from "./toast";
import { useFlashEffects } from "./effects/use-flash-effects";

// Register the default registry so selectors work outside <Provider>.
// This module is always loaded after registry.ts finishes, so defaultRegistry
// is guaranteed to be defined here.
setDefaultRegistry(defaultRegistry);

const defaultSprite: SpriteValue = { href: "" };

export function Provider({
  children,
  registry = defaultRegistry,
  sprite = defaultSprite,
  toaster = true,
}: {
  children: ReactNode;
  registry?: Registry;
  sprite?: SpriteValue;
  toaster?: boolean;
}) {
  useFlashEffects();

  return (
    <RegistryContext.Provider value={registry}>
      <SpriteProvider sprite={sprite}>
        {children}
        {toaster ? <Toaster /> : null}
      </SpriteProvider>
    </RegistryContext.Provider>
  );
}

export {
  useComponentRegistry,
  useColumnRegistry,
  useEffectHandlerRegistry,
  useChatPartRegistry,
} from "./core/registry-context";
