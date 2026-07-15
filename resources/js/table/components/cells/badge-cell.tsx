import { cn } from "@lattice-php/lattice/lib/utils";
import { coerceColor, namedColor, toneProps } from "@lattice-php/lattice/lib/color";
import { formatCell } from "@lattice-php/lattice/table/lib/format";
import type { ColumnCellComponent } from "@lattice-php/lattice/table/registry";

export const BadgeCell: ColumnCellComponent<"column.badge"> = ({ column, props, value }) => {
  const label = formatCell(value, column);

  if (label === "") {
    return null;
  }

  const tone = toneProps(coerceColor(props.colors?.[String(value)]) ?? namedColor("gray"));

  return (
    <span className={cn("lt-cell-badge", tone.className)} style={tone.style}>
      {label}
    </span>
  );
};
