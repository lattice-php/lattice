import { cn } from "@lattice-php/lattice/lib/utils";
import type { ColumnCellComponent } from "@lattice-php/lattice/table/registry";

export const ImageCell: ColumnCellComponent<"column.image"> = ({ column, props, value }) => {
  const url = typeof value === "string" ? value : "";

  if (url === "") {
    return null;
  }

  const size = props.size ?? 32;

  return (
    <img
      alt={column.props.label ?? undefined}
      src={url}
      width={size}
      height={size}
      className={cn("object-cover", props.circular ? "rounded-full" : "rounded-lt-sm")}
      style={{ width: size, height: size }}
    />
  );
};
