import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { LatticeComponentRegistry } from "./core/registry";
import { latticeRegistry } from "./registry";

type LatticeContextValue = {
  registry: LatticeComponentRegistry;
};

const LatticeContext = createContext<LatticeContextValue>({
  registry: latticeRegistry,
});

export function LatticeProvider({
  children,
  registry = latticeRegistry,
}: {
  children: ReactNode;
  registry?: LatticeComponentRegistry;
}) {
  const value = useMemo(() => ({ registry }), [registry]);

  return <LatticeContext.Provider value={value}>{children}</LatticeContext.Provider>;
}

export function useLatticeRegistry(): LatticeComponentRegistry {
  return useContext(LatticeContext).registry;
}
