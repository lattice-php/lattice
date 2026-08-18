import type { Node } from "@lattice-php/core/types";
import { translate } from "@lattice-php/ui/i18n";
import { actionLabel } from "./action-label";

export type ConfirmationLabels = {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
};

export function confirmationLabels(node: Node<"action" | "action.bulk">): ConfirmationLabels {
  const label = actionLabel(node);
  const confirmation = node.props.confirmation;

  return {
    title: confirmation?.title ?? label,
    description: confirmation?.description ?? undefined,
    confirmLabel: confirmation?.confirmLabel ?? label,
    cancelLabel: confirmation?.cancelLabel ?? translate("lattice", "common.cancel", "Cancel"),
  };
}
