import { IconRenderer } from "@lattice/lattice/icons";
import { cn } from "@lattice/lattice/lib/utils";
import type { TableColumn } from "../../types";
import { columnMap } from "./column-map";

export function IconCell({ column, value }: { column: TableColumn; value: unknown }) {
  const icon =
    columnMap(column, "icons")[String(value)] ?? (column.props?.icon as string | undefined);

  if (!icon) {
    return null;
  }

  const color = columnMap(column, "colors")[String(value)];

  return (
    <span
      aria-label={String(value)}
      className={cn("lt-cell-icon", color && `lt-cell-tone-${color}`)}
    >
      <IconRenderer className="size-4" icon={icon} />
    </span>
  );
}
