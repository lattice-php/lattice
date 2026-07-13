import { useT } from "@lattice-php/lattice/i18n";
import { Icon } from "@lattice-php/lattice/icons";
import { type ReactNode, useState } from "react";
import { Button } from "@lattice-php/lattice/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "./dialog";

interface PreviewableImageProps {
  src: string;
  alt: string;
  previewable: boolean;
  width?: number;
  height?: number;
  className?: string;
  testId?: string;
}

export function PreviewableImage({
  src,
  alt,
  previewable,
  width,
  height,
  className,
  testId,
}: PreviewableImageProps): ReactNode {
  const { t } = useT("lattice");
  const [open, setOpen] = useState(false);

  const image = (
    <img
      alt={alt}
      src={src}
      width={width}
      height={height}
      className={className}
      style={width ? { width, height } : undefined}
    />
  );

  if (!previewable) {
    return image;
  }

  const openLabel = t("common.image.open-preview", "View image");

  return (
    <>
      <button
        type="button"
        data-test={testId}
        className="cursor-zoom-in"
        aria-label={openLabel}
        onClick={() => setOpen(true)}
      >
        {image}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          aria-describedby={undefined}
          className="max-h-[90vh] max-w-[90vw] border-none bg-transparent p-0 shadow-none"
        >
          <DialogTitle className="sr-only">{alt || openLabel}</DialogTitle>
          <img
            alt={alt}
            src={src}
            data-slot="image-lightbox"
            className="max-h-[90vh] max-w-[90vw] rounded-lt object-contain"
          />
          <DialogClose asChild>
            <Button
              aria-label={t("common.close", "Close")}
              data-test="lightbox-close"
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 bg-lt-bg/80 hover:bg-lt-bg"
            >
              <Icon name="x" aria-hidden="true" className="size-lt-icon-md" />
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
