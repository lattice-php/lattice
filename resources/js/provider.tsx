import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { ComponentRegistry } from "./core/registry";
import { latticeRegistry } from "./registry";

type ContextValue = {
  registry: ComponentRegistry;
};

const LatticeContext = createContext<ContextValue>({
  registry: latticeRegistry,
});

export function LatticeProvider({
  children,
  registry = latticeRegistry,
}: {
  children: ReactNode;
  registry?: ComponentRegistry;
}) {
  const value = useMemo(() => ({ registry }), [registry]);

  return <LatticeContext.Provider value={value}>{children}</LatticeContext.Provider>;
}

export function useLatticeRegistry(): ComponentRegistry {
  return useContext(LatticeContext).registry;
}
