import { IconRenderer } from "@lattice-php/lattice/icons";
import { cn } from "@lattice-php/lattice/lib/utils";
import type { ColumnCellComponent } from "@lattice-php/lattice/table/registry";

export const IconCell: ColumnCellComponent<"column.icon"> = ({ props, value }) => {
  const icon = props.icons?.[String(value)] ?? props.icon ?? undefined;

  if (!icon) {
    return null;
  }

  const color = props.colors?.[String(value)];

  return (
    <span
      aria-label={String(value)}
      className={cn("lt-cell-icon", color && `lt-cell-tone-${color}`)}
    >
      <IconRenderer className="size-lt-icon-md" icon={icon} />
    </span>
  );
};
