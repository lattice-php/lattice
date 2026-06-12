import { cn } from "@lattice/lattice/lib/utils";
import { formatCell } from "../../format";
import type { TableColumn } from "../../types";
import { columnMap } from "./column-map";

export function BadgeCell({ column, value }: { column: TableColumn; value: unknown }) {
  const label = formatCell(value, column);

  if (label === "") {
    return null;
  }

  const color = columnMap(column, "colors")[String(value)] ?? "gray";

  return <span className={cn("lt-cell-badge", `lt-cell-tone-${color}`)}>{label}</span>;
}
