import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { ComponentRegistry, Registry } from "./core/registry";
import { SpriteProvider } from "./icons/sprite";
import type { SpriteValue } from "./icons/sprite";
import { registry as defaultRegistry } from "./registry";
import type { ColumnRegistry } from "./table/column-registry";
import { Toaster, useFlashToasts } from "./toast";

const defaultSprite: SpriteValue = { href: "" };

const RegistryContext = createContext<Registry>(defaultRegistry);

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
  useFlashToasts();

  return (
    <RegistryContext.Provider value={registry}>
      <SpriteProvider sprite={sprite}>
        {children}
        {toaster ? <Toaster /> : null}
      </SpriteProvider>
    </RegistryContext.Provider>
  );
}

export function useRegistry(): ComponentRegistry {
  return useContext(RegistryContext).components;
}

export function useColumnRegistry(): ColumnRegistry {
  return useContext(RegistryContext).columns;
}
