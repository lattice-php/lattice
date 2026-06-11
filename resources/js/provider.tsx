import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { ComponentRegistry } from "./core/registry";
import { registry as defaultRegistry } from "./registry";
import type { ColumnRegistry } from "./table/column-registry";

type ContextValue = {
  columns: ColumnRegistry;
  registry: ComponentRegistry;
};

const defaultColumns: ColumnRegistry = {};

const RegistryContext = createContext<ContextValue>({
  columns: defaultColumns,
  registry: defaultRegistry,
});

export function Provider({
  children,
  columns = defaultColumns,
  registry = defaultRegistry,
}: {
  children: ReactNode;
  columns?: ColumnRegistry;
  registry?: ComponentRegistry;
}) {
  const value = useMemo(() => ({ columns, registry }), [columns, registry]);

  return <RegistryContext.Provider value={value}>{children}</RegistryContext.Provider>;
}

export function useRegistry(): ComponentRegistry {
  return useContext(RegistryContext).registry;
}

export function useColumnRegistry(): ColumnRegistry {
  return useContext(RegistryContext).columns;
}
