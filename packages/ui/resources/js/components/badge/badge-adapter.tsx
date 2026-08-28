import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Badge } from "./badge";

export const BadgeAdapter: RendererComponent<"badge"> = ({ node }) => (
  <Badge
    className={node.props.class ?? undefined}
    color={node.props.color}
    data-test={nodeIdentity(node)}
  >
    {node.props.label}
  </Badge>
);
