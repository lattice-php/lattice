import { cn } from "@lattice/lattice/lib/utils";
import type { TableColumn } from "../../types";

export function ImageCell({ column, value }: { column: TableColumn; value: unknown }) {
  const url = typeof value === "string" ? value : "";

  if (url === "") {
    return null;
  }

  const circular = column.props?.circular === true;
  const size = typeof column.props?.size === "number" ? column.props.size : 32;

  return (
    <img
      alt={column.label}
      src={url}
      width={size}
      height={size}
      className={cn("object-cover", circular ? "rounded-full" : "rounded-lt-sm")}
      style={{ width: size, height: size }}
    />
  );
}
