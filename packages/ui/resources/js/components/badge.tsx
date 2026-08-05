import type { RendererComponent } from "@lattice-php/core/types";
import { Badge } from "../badge";

const BadgeComponent: RendererComponent<"badge"> = ({ node }) => (
  <Badge color={node.props.color}>{node.props.label}</Badge>
);

export default BadgeComponent;
export { Badge };
