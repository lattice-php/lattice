import { cn } from "@lattice/lattice/lib/utils";
import type { ImageColumnProps } from "@lattice/lattice/types/generated";
import type { TableColumn } from "../../types";

export function ImageCell({ column, value }: { column: TableColumn; value: unknown }) {
  const url = typeof value === "string" ? value : "";

  if (url === "") {
    return null;
  }

  const props = column.props as ImageColumnProps | null;
  const size = props?.size ?? 32;

  return (
    <img
      alt={column.label}
      src={url}
      width={size}
      height={size}
      className={cn("object-cover", props?.circular ? "rounded-full" : "rounded-lt-sm")}
      style={{ width: size, height: size }}
    />
  );
}
