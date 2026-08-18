import { Badge } from "@lattice-php/ui/components/badge/badge";
import { formatCell } from "@lattice-php/table/lib/format";
import type { ColumnCellComponent } from "@lattice-php/table/registry";

export const BadgeCell: ColumnCellComponent<"column.badge"> = ({ column, props, value }) => {
  const label = formatCell(value, column);

  if (label === "") {
    return null;
  }

  return <Badge color={props.colors?.[String(value)]}>{label}</Badge>;
};
