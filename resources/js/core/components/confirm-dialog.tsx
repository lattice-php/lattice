import * as Dialog from "@radix-ui/react-dialog";
import type { ButtonVariant } from "@lattice/lattice/types/generated";
import { Button } from "./button";
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
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) {
          onCancel();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          {...(description ? {} : { "aria-describedby": undefined })}
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lt border border-lt-border bg-lt-bg p-6 shadow-lg"
          onEscapeKeyDown={blockWhileProcessing}
          onInteractOutside={blockWhileProcessing}
        >
          <div className="grid gap-2">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </Dialog.Title>
            {description && (
              <Dialog.Description className="text-sm text-lt-muted-fg">
                {description}
              </Dialog.Description>
            )}
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
