import type { ReactNode } from "react";
import { ActionInteractionProvider } from "@lattice-php/action/components/action-trigger-provider";
import type { Registry } from "@lattice-php/core/registry";
import { RegistryProvider } from "@lattice-php/core/registry-context";
import { useFlashEffects } from "./effects/use-flash-effects";
import { NavigationProvider } from "@lattice-php/ui/navigation";
import { ModalProvider } from "@lattice-php/ui/components/modal/modal-host";
import { EventBridge } from "./event-bridge";
import { useCloseModalsOnNavigate, useInertiaNavigation } from "./inertia-navigation";
import type { SpriteValue } from "@lattice-php/ui/icons/sprite";
import { SpriteProvider } from "@lattice-php/ui/icons/sprite";
import { Toaster } from "@lattice-php/ui/toast";
import { updateAppearance } from "./appearance";

const defaultSprite: SpriteValue = { href: "" };

export type ProviderBaseProps = {
  children: ReactNode;
  /** The url of the page being rendered, so the first render already knows it (SSR included). */
  initialUrl?: string;
  registry: Registry;
  sprite?: SpriteValue;
  toaster?: boolean;
};

export function ProviderBase({
  children,
  initialUrl,
  registry,
  sprite = defaultSprite,
  toaster = true,
}: ProviderBaseProps) {
  useFlashEffects();
  useCloseModalsOnNavigate();
  const navigation = useInertiaNavigation(initialUrl);

  return (
    <RegistryProvider registry={registry}>
      <NavigationProvider adapter={navigation}>
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
