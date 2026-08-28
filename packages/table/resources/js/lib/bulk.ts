import type { Node } from "@lattice-php/core/types";
import type { Emphasis, Variant } from "@lattice-php/ui/generated";

/**
 * The slice of the action wire props the bulk bar renders, typed structurally:
 * the table package does not depend on the action package, so its build never
 * sees action's `ComponentProps` augmentation.
 */
export type BulkActionNode = Node<"action" | "action.bulk"> & {
  props: {
    emphasis: Emphasis | null;
    endpoint: string | null;
    label: string | null;
    variant: Variant | null;
  };
};

export function getBulkActionNodes(bulkActions: unknown): BulkActionNode[] {
  if (!Array.isArray(bulkActions)) {
    return [];
  }

  return (bulkActions as Node[]).flatMap((node): BulkActionNode[] => {
    if (node.type !== "action" && node.type !== "action.bulk") {
      return [];
    }

    const action = node as BulkActionNode;

    return action.props.endpoint ? [action] : [];
  });
}
