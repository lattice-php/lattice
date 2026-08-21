import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Badge } from "./badge";

const BadgeAdapter: RendererComponent<"badge"> = ({ node }) => (
  <Badge color={node.props.color} data-lattice-component={nodeIdentity(node)}>
    {node.props.label}
  </Badge>
);

export default BadgeAdapter;
