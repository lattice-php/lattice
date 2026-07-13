import { cn } from "@lattice-php/lattice/lib/utils";
import type { ColumnCellComponent } from "@lattice-php/lattice/table/registry";
import { PreviewableImage } from "@lattice-php/lattice/ui/image-preview";

export const ImageCell: ColumnCellComponent<"column.image"> = ({ column, props, value }) => {
  const url = typeof value === "string" ? value : "";

  if (url === "") {
    return null;
  }

  const size = props.size ?? 32;

  return (
    <PreviewableImage
      alt={column.props.label ?? ""}
      className={cn("object-cover", props.circular ? "rounded-full" : "rounded-lt-sm")}
      height={size}
      previewable={props.previewable}
      src={url}
      testId={`preview-${column.key}`}
      width={size}
    />
  );
};
