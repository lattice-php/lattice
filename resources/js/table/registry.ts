import type { ReactNode } from "react";
import type { ColumnPropsOf, TableColumn, TableRow } from "./types";

export type ColumnCellArgs<TType extends string = string> = {
  /** The full wire column (key, label, type, nested columns). */
  column: TableColumn;
  /** The column's `props`, resolved to the type's shape. */
  props: ColumnPropsOf<TType>;
  row: TableRow;
  value: unknown;
};

export type ColumnCellComponent<TType extends string = string> = (
  args: ColumnCellArgs<TType>,
) => ReactNode;

export type ColumnRegistry = Record<string, ColumnCellComponent>;

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
