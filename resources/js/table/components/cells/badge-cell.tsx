import { cn } from "@lattice/lattice/lib/utils";
import type { BadgeColumnProps } from "@lattice/lattice/types/generated";
import { formatCell } from "../../format";
import type { TableColumn } from "../../types";

export function BadgeCell({ column, value }: { column: TableColumn; value: unknown }) {
  const label = formatCell(value, column);

  if (label === "") {
    return null;
  }

  const props = column.props as BadgeColumnProps | null;
  const color = props?.colors?.[String(value)] ?? "gray";

  return <span className={cn("lt-cell-badge", `lt-cell-tone-${color}`)}>{label}</span>;
}
