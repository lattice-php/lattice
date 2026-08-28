import { UI_NAMESPACE, useT } from "../i18n";
import { type ComponentProps, type ReactNode, useState } from "react";
import { Button } from "../components/button/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "./dialog";

export type PreviewableImageProps = Omit<ComponentProps<"img">, "children"> & {
  alt: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  previewable: boolean;
  previewSrc?: string | null;
  testId?: string;
};

export function PreviewableImage({
  src,
  alt,
  defaultOpen = false,
  onOpenChange,
  open: controlledOpen,
  previewable,
  previewSrc,
  width,
  height,
  className,
  style,
  testId,
  ...props
}: PreviewableImageProps): ReactNode {
  const { t } = useT(UI_NAMESPACE);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const image = (
    <img
      {...props}
      alt={alt}
      src={src}
      width={width}
      height={height}
      className={className}
      style={width ? { ...style, width, height } : style}
    />
  );

  if (!previewable) {
    return image;
  }

  const openLabel = t("common.image.open-preview", "View image");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" data-test={testId} className="cursor-zoom-in" aria-label={openLabel}>
          {image}
        </button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="max-h-[90vh] w-auto max-w-[90vw] border-none bg-transparent p-0 shadow-none"
      >
        <DialogTitle className="sr-only">{alt || openLabel}</DialogTitle>
        <img
          alt={alt}
          src={previewSrc ?? src}
          data-slot="image-lightbox"
          className="max-h-[90vh] max-w-[90vw] rounded-lt object-contain"
        />
        <DialogClose asChild>
          <Button
            icon="x"
            aria-label={t("common.close", "Close")}
            data-test="lightbox-close"
            size="icon"
            emphasis="ghost"
            className="absolute top-2 right-2 bg-lt-bg/80 hover:bg-lt-bg"
          />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
