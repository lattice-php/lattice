import type { HttpMethod } from "@lattice-php/ui/types";
import type { Node } from "@lattice-php/core/types";
import type { Emphasis, Variant } from "@lattice-php/ui/button";
import { translate } from "@lattice-php/ui/i18n";
import type { ModalWidth, Side } from "@lattice-php/ui/types";

type Confirmation = {
  title: string | null;
  description: string | null;
  confirmLabel: string | null;
  cancelLabel: string | null;
};

type BulkActionProps = {
  confirmation: Confirmation | null;
  emphasis: Emphasis | null;
  endpoint: string | null;
  form: Node | null;
  label: string | null;
  method: HttpMethod | null;
  modalSide: Side | null;
  modalWidth: ModalWidth | null;
  ref: string | null;
  variant: Variant | null;
};

export type BulkAction = {
  id: string;
  label: string;
  method: HttpMethod;
  endpoint: string;
  ref: string;
  variant: Variant | null;
  emphasis: Emphasis | null;
  confirmation: Confirmation | null;
  form: Node | null;
  modalSide: Side | null;
  modalWidth: ModalWidth | null;
};

export function getBulkActions(actions: Node[] | undefined): BulkAction[] {
  return (actions ?? []).flatMap((node): BulkAction[] => {
    if (node.type !== "action" && node.type !== "action.bulk") {
      return [];
    }

    const props = node.props as BulkActionProps | undefined;

    if (!props?.endpoint) {
      return [];
    }

    return [
      {
        id: node.id ?? "",
        label: props.label ?? translate("lattice", "common.action.run", "Run action"),
        method: props.method ?? "post",
        endpoint: props.endpoint,
        ref: props.ref ?? "",
        variant: props.variant,
        emphasis: props.emphasis,
        confirmation: props.confirmation,
        form: props.form,
        modalSide: props.modalSide,
        modalWidth: props.modalWidth,
      },
    ];
  });
}
