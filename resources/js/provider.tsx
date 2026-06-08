import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { ComponentRegistry } from "./core/registry";
import { registry as defaultRegistry } from "./registry";

type ContextValue = {
  registry: ComponentRegistry;
};

const RegistryContext = createContext<ContextValue>({
  registry: defaultRegistry,
});

export function Provider({
  children,
  registry = defaultRegistry,
}: {
  children: ReactNode;
  registry?: ComponentRegistry;
}) {
  const value = useMemo(() => ({ registry }), [registry]);

  return <RegistryContext.Provider value={value}>{children}</RegistryContext.Provider>;
}

export function useRegistry(): ComponentRegistry {
  return useContext(RegistryContext).registry;
}
