import type { ButtonVariant } from "@lattice-php/lattice/types/generated";
import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog";
import { Spinner } from "./spinner";

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  confirmVariant = "default",
  processing = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  processing?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const blockWhileProcessing = (event: Event): void => {
    if (processing) {
      event.preventDefault();
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onCancel();
        }
      }}
    >
      <DialogContent
        {...(description ? {} : { "aria-describedby": undefined })}
        width="md"
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
            variant="outline"
            data-test="confirm-cancel"
            disabled={processing}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
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
