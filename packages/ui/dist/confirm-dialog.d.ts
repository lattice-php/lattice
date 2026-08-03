import { Emphasis, Variant } from "./button.js";
export declare function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmVariant,
  confirmEmphasis,
  processing,
  confirmDisabled,
  onConfirm,
  onCancel,
}: {
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
}): import("react").JSX.Element;
