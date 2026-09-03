import { Icon } from "@lattice-php/ui/icons";
import { cn } from "@lattice-php/ui/lib/utils";
import { PreviewableImage } from "@lattice-php/ui/primitives/image-preview";
import { kindIcon, typeLabel } from "./file-type";
import type { MediaRow } from "./media-row";

function isImage(row: MediaRow): boolean {
  return row.mime_type.startsWith("image/");
}

/** The square face of a card or list row: the derivative, or the type icon. */
export function MediaThumb({
  className,
  row,
  testId,
}: {
  className?: string;
  row: MediaRow;
  testId?: string;
}) {
  if (isImage(row) && row.preview_url !== null) {
    return (
      <img
        alt={row.alt ?? row.name}
        className={cn("object-cover", className)}
        data-test={testId}
        loading="lazy"
        src={row.preview_url}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex flex-col items-center justify-center gap-1 bg-lt-muted text-lt-muted-fg",
        className,
      )}
      data-test={testId ?? "media-thumb-icon"}
    >
      <Icon className="size-lt-icon-lg" name={kindIcon(row.mime_type)} />
      <span className="text-xs uppercase">{typeLabel(row.name, row.mime_type)}</span>
    </span>
  );
}

/**
 * The large preview in the inspector. Images use the original, not the
 * derivative: one src feeds both this image and the lightbox it opens, and
 * zooming into a cover-cropped thumbnail shows less than the panel already did.
 */
export function MediaPreview({ row }: { row: MediaRow }) {
  if (isImage(row) && row.url !== null) {
    return (
      <PreviewableImage
        alt={row.alt ?? row.name}
        className="h-48 w-full rounded-lt-sm border border-lt-border object-contain"
        previewable
        src={row.url}
        testId="media-detail-preview"
      />
    );
  }

  return (
    <MediaThumb
      className="h-32 w-full rounded-lt-sm border border-lt-border"
      row={row}
      testId="media-detail-preview"
    />
  );
}
