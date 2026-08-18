import type { ReactNode } from "react";
import { ActionInteractionProvider } from "@lattice-php/action/components/action-trigger-provider";
import type { Registry } from "@lattice-php/core/registry";
import { RegistryContext } from "@lattice-php/core/registry-context";
import { useFlashEffects } from "./effects/use-flash-effects";
import { NavigationProvider } from "@lattice-php/ui/navigation";
import { ModalHostProvider } from "@lattice-php/ui/modal-host";
import { EventBridge } from "./event-bridge";
import { inertiaNavigation } from "./inertia-navigation";
import type { SpriteValue } from "@lattice-php/ui/icons/sprite";
import { SpriteProvider } from "@lattice-php/ui/icons/sprite";
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
      <NavigationProvider adapter={inertiaNavigation}>
        <ActionInteractionProvider>
          <SpriteProvider sprite={sprite}>
            <ModalHostProvider>
              {children}
              <EventBridge onAppearanceChange={updateAppearance} />
              {toaster ? <Toaster /> : null}
            </ModalHostProvider>
          </SpriteProvider>
        </ActionInteractionProvider>
      </NavigationProvider>
    </RegistryContext.Provider>
  );
}
