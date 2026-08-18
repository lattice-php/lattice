import type { Node } from "@lattice-php/core/types";

type BulkActionProps = {
  endpoint: string | null;
};

export function getBulkActionNodes(bulkActions: unknown): Node<"action" | "action.bulk">[] {
  if (!Array.isArray(bulkActions)) {
    return [];
  }

  return (bulkActions as Node[]).flatMap((node): Node<"action" | "action.bulk">[] => {
    if (node.type !== "action" && node.type !== "action.bulk") {
      return [];
    }

    const props = node.props as BulkActionProps | undefined;

    if (!props?.endpoint) {
      return [];
    }

    return [node as Node<"action" | "action.bulk">];
  });
}
