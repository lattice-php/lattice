import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Avatar } from "./avatar";

const AvatarAdapter: RendererComponent<"avatar"> = ({ node }) => (
  <Avatar
    data-lattice-component={nodeIdentity(node)}
    name={node.props.name}
    shape={node.props.shape}
    size={node.props.size}
    src={node.props.src}
  />
);

export default AvatarAdapter;
