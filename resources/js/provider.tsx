import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { ComponentRegistry } from "./core/registry";
import { registry as defaultRegistry } from "./registry";

type ContextValue = {
  registry: ComponentRegistry;
};

const LatticeContext = createContext<ContextValue>({
  registry: defaultRegistry,
});

export function LatticeProvider({
  children,
  registry = defaultRegistry,
}: {
  children: ReactNode;
  registry?: ComponentRegistry;
}) {
  const value = useMemo(() => ({ registry }), [registry]);

  return <LatticeContext.Provider value={value}>{children}</LatticeContext.Provider>;
}

export function useRegistry(): ComponentRegistry {
  return useContext(LatticeContext).registry;
}
