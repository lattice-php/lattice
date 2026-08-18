import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog";
import type { Emphasis, Variant } from "./generated";
import { Spinner } from "./spinner";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  confirmVariant = null,
  confirmEmphasis = null,
  processing = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
  onExited,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: Variant | null;
  confirmEmphasis?: Emphasis | null;
  processing?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onExited?: (event: Event) => void;
}) {
  const blockWhileProcessing = (event: Event): void => {
    if (processing) {
      event.preventDefault();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onCancel();
        }
      }}
    >
      <DialogContent
        {...(description ? {} : { "aria-describedby": undefined })}
        width="md"
        onCloseAutoFocus={onExited}
        onEscapeKeyDown={blockWhileProcessing}
        onInteractOutside={blockWhileProcessing}
      >
        <div className="grid gap-2">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            emphasis="outline"
            data-test="confirm-cancel"
            disabled={processing}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            emphasis={confirmEmphasis}
            variant={confirmVariant}
            data-test="confirm-accept"
            disabled={processing || confirmDisabled}
            onClick={onConfirm}
          >
            {processing && <Spinner />}
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
