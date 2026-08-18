import type { RendererComponent } from "@lattice-php/core/types";
import { Avatar } from "./avatar";

const AvatarAdapter: RendererComponent<"avatar"> = ({ node }) => (
  <Avatar
    name={node.props.name}
    shape={node.props.shape}
    size={node.props.size}
    src={node.props.src}
  />
);

export default AvatarAdapter;
