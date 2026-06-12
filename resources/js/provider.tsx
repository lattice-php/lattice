import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { ComponentRegistry, Registry } from "./core/registry";
import { registry as defaultRegistry } from "./registry";
import type { ColumnRegistry } from "./table/column-registry";
import { Toaster } from "./toast";

const RegistryContext = createContext<Registry>(defaultRegistry);

export function Provider({
  children,
  registry = defaultRegistry,
  toaster = true,
}: {
  children: ReactNode;
  registry?: Registry;
  toaster?: boolean;
}) {
  const value = useMemo(() => registry, [registry]);

  return (
    <RegistryContext.Provider value={value}>
      {children}
      {toaster ? <Toaster /> : null}
    </RegistryContext.Provider>
  );
}

export function useRegistry(): ComponentRegistry {
  return useContext(RegistryContext).components;
}

export function useColumnRegistry(): ColumnRegistry {
  return useContext(RegistryContext).columns;
}
