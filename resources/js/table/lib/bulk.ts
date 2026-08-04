import type { Method } from "@inertiajs/core";
import type { Node } from "@lattice-php/core/types";
import type { Action, Emphasis, Variant } from "@lattice-php/lattice/types/generated";
import type { ActionNode } from "@lattice-php/lattice/table/types";
import { actionLabel } from "@lattice-php/lattice/action/lib/action-label";

export type BulkAction = {
  id: string;
  label: string;
  method: Method;
  endpoint: string;
  ref: string;
  variant: Variant | null;
  emphasis: Emphasis | null;
  confirmation: Action["confirmation"];
  form: Node | null;
  modalSide: Action["modalSide"];
  modalWidth: Action["modalWidth"];
};

type BulkActionNode = Extract<ActionNode, { type: "action" | "action.bulk" }>;

export function getBulkActions(actions: Node[] | undefined): BulkAction[] {
  return (actions ?? []).flatMap((node): BulkAction[] => {
    if (node.type !== "action" && node.type !== "action.bulk") {
      return [];
    }

    const action = node as BulkActionNode;
    const props = action.props;

    if (!props.endpoint) {
      return [];
    }

    return [
      {
        id: action.id ?? "",
        label: actionLabel(action),
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
