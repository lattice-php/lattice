import { IconRenderer } from "@lattice/lattice/icons";
import { cn } from "@lattice/lattice/lib/utils";
import type { IconColumnProps } from "@lattice/lattice/types/generated";
import type { TableColumn } from "../../types";

export function IconCell({ column, value }: { column: TableColumn; value: unknown }) {
  const props = column.props as IconColumnProps | null;
  const icon = props?.icons?.[String(value)] ?? props?.icon ?? undefined;

  if (!icon) {
    return null;
  }

  const color = props?.colors?.[String(value)];

  return (
    <span
      aria-label={String(value)}
      className={cn("lt-cell-icon", color && `lt-cell-tone-${color}`)}
    >
      <IconRenderer className="size-lt-icon-md" icon={icon} />
    </span>
  );
}
