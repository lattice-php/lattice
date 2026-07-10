import { cn } from "@lattice-php/lattice/lib/utils";
import { formatCell } from "@lattice-php/lattice/table/lib/format";
import type { ColumnCellComponent } from "@lattice-php/lattice/table/registry";

export const BadgeCell: ColumnCellComponent<"column.badge"> = ({ column, props, value }) => {
  const label = formatCell(value, column);

  if (label === "") {
    return null;
  }

  const color = props.colors?.[String(value)] ?? "gray";

  return <span className={cn("lt-cell-badge", `lt-cell-tone-${color}`)}>{label}</span>;
};
