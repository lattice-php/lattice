import type { ReactNode } from "react";
import type { TableColumn, TableRow } from "./types";

export type ColumnCellArgs = {
  column: TableColumn;
  row: TableRow;
  value: unknown;
};

export type ColumnCellComponent = (args: ColumnCellArgs) => ReactNode;

export type ColumnRegistry = Record<string, ColumnCellComponent>;
