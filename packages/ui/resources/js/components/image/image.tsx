import type { PreviewableImageProps } from "./image-preview";
import { PreviewableImage } from "./image-preview";
import { cn } from "../../lib/utils";

export type ImageProps = Omit<PreviewableImageProps, "alt" | "previewable"> & {
  alt?: string | null;
  circular?: boolean;
  previewable?: boolean;
  size?: number | null;
};

export function Image({
  alt,
  circular = false,
  className,
  height,
  previewable = false,
  size,
  width,
  ...props
}: ImageProps) {
  return (
    <PreviewableImage
      {...props}
      alt={alt ?? ""}
      className={cn("object-cover", circular ? "rounded-full" : "rounded-lt-sm", className)}
      height={size ?? height}
      previewable={previewable}
      width={size ?? width}
    />
  );
}
