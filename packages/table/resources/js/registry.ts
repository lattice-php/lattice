import type { ReactNode } from "react";
import { useExtensionRegistry } from "@lattice-php/core/registry-context";
import type { ColumnPropsOf, TableColumn, TableRow } from "./types";
import type { ColumnPropsMap } from "@lattice-php/core/generated";

export type ColumnCellArgs<TType extends string = string> = {
  column: TableColumn;
  props: ColumnPropsOf<TType>;
  row: TableRow;
  value: unknown;
};

export type ColumnCellComponent<TType extends string = string> = (
  args: ColumnCellArgs<TType>,
) => ReactNode;

export type ColumnRegistry = Record<string, ColumnCellComponent>;

export const COLUMN_REGISTRY_EXTENSION = "table.columns";

export function useColumnRegistry(): ColumnRegistry {
  return useExtensionRegistry<ColumnRegistry>(COLUMN_REGISTRY_EXTENSION);
}

export type ColumnRegistryFor<TTypes extends keyof ColumnPropsMap & string> = Record<
  TTypes,
  ColumnCellComponent
>;

/**
 * Registers a typed column cell, erasing the type parameter so it fits the
 * registry. Mirrors `eagerComponent`/`lazyComponent` for the component registry:
 * author against `ColumnCellComponent<"my.type">` for typed `props`, register
 * through this.
 */
export function columnCell<TType extends string>(
  cell: ColumnCellComponent<TType>,
): ColumnCellComponent {
  return cell as ColumnCellComponent;
}
