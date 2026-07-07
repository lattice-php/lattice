import type { Method } from "@inertiajs/core";
import type { Node } from "@lattice-php/lattice/core/types";
import type { Action, ButtonVariant } from "@lattice-php/lattice/types/generated";
import type { ActionNode } from "./types";

export type BulkAction = {
  id: string;
  label: string;
  method: Method;
  endpoint: string;
  ref: string;
  variant: ButtonVariant;
  confirmation: Action["confirmation"];
  form: Node | null;
};

export function getBulkActions(actions: ActionNode[] | undefined): BulkAction[] {
  return (actions ?? []).flatMap((node): BulkAction[] => {
    if (node.type === "action.group") {
      return [];
    }

    const props = node.props;

    if (!props.endpoint) {
      return [];
    }

    return [
      {
        id: node.id ?? "",
        label: props.label ?? "Run action",
        method: props.method ?? "post",
        endpoint: props.endpoint,
        ref: props.ref ?? "",
        variant: props.variant ?? "default",
        confirmation: props.confirmation,
        form: props.form,
      },
    ];
  });
}
