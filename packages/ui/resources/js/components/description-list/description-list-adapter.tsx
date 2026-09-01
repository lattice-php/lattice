import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { DescriptionList } from "./description-list";

export const DescriptionListAdapter: RendererComponent<"description-list"> = ({
  children,
  node,
}) => (
  <DescriptionList
    bleed={node.props.bleed}
    className={node.props.class ?? undefined}
    data-test={nodeIdentity(node)}
    divided={node.props.divided}
    emptyLabel={node.props.emptyLabel}
    semantic={node.props.semantic}
  >
    {children}
  </DescriptionList>
);
