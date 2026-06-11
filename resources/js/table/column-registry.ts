import type { ReactNode } from "react";
import type { TableColumn, TableRow } from "./types";

export type ColumnCellArgs = {
  column: TableColumn;
  row: TableRow;
  value: unknown;
};

export type ColumnCellComponent = (args: ColumnCellArgs) => ReactNode;

export type ColumnRegistry = Record<string, ColumnCellComponent>;

export type ColumnPlugin = {
  columns: ColumnRegistry;
  name: string;
};

export function createColumnPlugin(plugin: ColumnPlugin): ColumnPlugin {
  return plugin;
}

export function createColumnRegistry(...plugins: ColumnPlugin[]): ColumnRegistry {
  return plugins.reduce<ColumnRegistry>(
    (registry, plugin) => ({ ...registry, ...plugin.columns }),
    {},
  );
}

export function extendColumnRegistry(
  registry: ColumnRegistry,
  ...plugins: ColumnPlugin[]
): ColumnRegistry {
  return { ...registry, ...createColumnRegistry(...plugins) };
}
