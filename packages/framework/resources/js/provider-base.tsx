import type { ReactNode } from "react";
import { ActionInteractionProvider } from "@lattice-php/action/components/action-trigger-provider";
import type { Registry } from "@lattice-php/core/registry";
import { RegistryProvider } from "@lattice-php/core/registry-context";
import { useFlashEffects } from "./effects/use-flash-effects";
import { NavigationProvider } from "@lattice-php/ui/navigation";
import { ModalProvider } from "@lattice-php/ui/modal";
import { EventBridge } from "./event-bridge";
import { inertiaNavigation, useCloseModalsOnNavigate } from "./inertia-navigation";
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
  useCloseModalsOnNavigate();

  return (
    <RegistryProvider registry={registry}>
      <NavigationProvider adapter={inertiaNavigation}>
        <ActionInteractionProvider>
          <SpriteProvider sprite={sprite}>
            <ModalProvider>
              {children}
              <EventBridge onAppearanceChange={updateAppearance} />
              {toaster ? <Toaster /> : null}
            </ModalProvider>
          </SpriteProvider>
        </ActionInteractionProvider>
      </NavigationProvider>
    </RegistryProvider>
  );
}
