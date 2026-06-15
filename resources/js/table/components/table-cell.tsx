import { useColumnRegistry } from "../../provider";
import { columnCell, type ColumnRegistry } from "../registry";
import type { TableColumn, TableRow } from "../types";
import { BadgeCell } from "./cells/badge-cell";
import { BooleanCell } from "./cells/boolean-cell";
import { IconCell } from "./cells/icon-cell";
import { ImageCell } from "./cells/image-cell";
import { NumberCell } from "./cells/number-cell";
import { StackCell } from "./cells/stack-cell";
import { TextCell } from "./cells/text-cell";

// Built-in cells live with the (lazy-loaded) table feature rather than the
// eager registry, so they stay code-split. Consumer-registered columns are
// merged on top and win on type collisions.
const builtinColumnCells: ColumnRegistry = {
  badge: columnCell(BadgeCell),
  boolean: columnCell(BooleanCell),
  icon: columnCell(IconCell),
  image: columnCell(ImageCell),
  number: columnCell(NumberCell),
  stack: columnCell(StackCell),
  text: columnCell(TextCell),
};

export function ColumnCell({ column, row }: { column: TableColumn; row: TableRow }) {
  const customCells = useColumnRegistry();
  const Cell =
    customCells[column.type] ?? builtinColumnCells[column.type] ?? builtinColumnCells.text;

  return <Cell column={column} props={column.props ?? {}} row={row} value={row[column.key]} />;
}
