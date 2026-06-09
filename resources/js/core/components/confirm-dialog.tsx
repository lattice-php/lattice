import { type ComponentProps, useId } from "react";
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
  confirmVariant?: ComponentProps<typeof Button>["variant"];
  processing?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-md rounded-lt border border-lt-border bg-lt-bg p-6 shadow-lg"
        role="dialog"
      >
        <div className="grid gap-2">
          <h2 className="text-lg font-semibold leading-none tracking-tight" id={titleId}>
            {title}
          </h2>
          {description && <p className="text-sm text-lt-muted-fg">{description}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={processing} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            disabled={processing || confirmDisabled}
            onClick={onConfirm}
          >
            {processing && <Spinner />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
