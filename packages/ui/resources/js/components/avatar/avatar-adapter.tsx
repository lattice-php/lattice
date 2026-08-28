import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Avatar } from "./avatar";

export const AvatarAdapter: RendererComponent<"avatar"> = ({ node }) => (
  <Avatar
    className={node.props.class ?? undefined}
    data-test={nodeIdentity(node)}
    name={node.props.name}
    shape={node.props.shape}
    size={node.props.size}
    src={node.props.src}
  />
);
