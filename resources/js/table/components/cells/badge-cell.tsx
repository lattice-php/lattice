import { cn } from "@lattice-php/lattice/lib/utils";
import { formatCell } from "../../format";
import type { ColumnCellComponent } from "../../registry";

export const BadgeCell: ColumnCellComponent<"badge"> = ({ column, props, value }) => {
  const label = formatCell(value, column);

  if (label === "") {
    return null;
  }

  const color = props.colors?.[String(value)] ?? "gray";

  return <span className={cn("lt-cell-badge", `lt-cell-tone-${color}`)}>{label}</span>;
};
