import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Text } from "./text";

const TextAdapter: RendererComponent<"text"> = ({ node }) => (
  <Text
    align={node.props.align === "center" ? "center" : "left"}
    color={node.props.color}
    copyable={node.props.copyable}
    copyLabel={node.props.text}
    copyValue={node.props.text}
    data-lattice-component={nodeIdentity(node)}
    size={node.props.size}
  >
    {node.props.text}
  </Text>
);

export default TextAdapter;
