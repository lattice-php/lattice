import { IconRenderer } from "@lattice-php/lattice/icons";
import { cn } from "@lattice-php/lattice/lib/utils";
import { coerceColor, toneProps } from "@lattice-php/lattice/lib/color";
import type { ColumnCellComponent } from "@lattice-php/lattice/table/registry";

export const IconCell: ColumnCellComponent<"column.icon"> = ({ props, value }) => {
  const icon = props.icons?.[String(value)] ?? props.icon ?? undefined;

  if (!icon) {
    return null;
  }

  const color = coerceColor(props.colors?.[String(value)]);
  const tone = color ? toneProps(color) : undefined;

  return (
    <span
      aria-label={String(value)}
      className={cn("lt-cell-icon", tone?.className)}
      style={tone?.style}
    >
      <IconRenderer className="size-lt-icon-md" icon={icon} />
    </span>
  );
};
