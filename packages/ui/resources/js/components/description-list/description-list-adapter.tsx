import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { DescriptionList } from "./description-list";

const DescriptionListAdapter: RendererComponent<"description-list"> = ({ children, node }) => (
  <DescriptionList
    bleed={node.props.bleed}
    data-lattice-component={nodeIdentity(node)}
    divided={node.props.divided}
    emptyLabel={node.props.emptyLabel}
    semantic={node.props.semantic === "list" ? "list" : "description-list"}
  >
    {children}
  </DescriptionList>
);

export default DescriptionListAdapter;
