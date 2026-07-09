import type { Node } from "@lattice-php/lattice/core/types";
import ActionComponent from "@lattice-php/lattice/action/components/action";
import ActionGroupComponent from "@lattice-php/lattice/action/components/action-group";
import LinkComponent from "@lattice-php/lattice/ui/link";

export function TableActionNode({ node }: { node: Node }) {
  if (node.type === "action") {
    return <ActionComponent node={node as Node<"action">}>{null}</ActionComponent>;
  }

  if (node.type === "action.group") {
    return (
      <ActionGroupComponent node={node as Node<"action.group">}>
        {node.schema?.map((childNode, index) => (
          <TableActionNode
            key={childNode.key ?? childNode.id ?? `${childNode.type}-${index}`}
            node={childNode}
          />
        )) ?? null}
      </ActionGroupComponent>
    );
  }

  if (node.type === "link") {
    return <LinkComponent node={node as Node<"link">}>{null}</LinkComponent>;
  }

  return null;
}
