import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Text } from "./text";

export const TextAdapter: RendererComponent<"text"> = ({ node }) => (
  <Text
    align={node.props.align === "center" ? "center" : "left"}
    className={node.props.class ?? undefined}
    color={node.props.color}
    copyable={node.props.copyable}
    copyLabel={node.props.text}
    copyValue={node.props.text}
    data-test={nodeIdentity(node)}
    size={node.props.size}
  >
    {node.props.text}
  </Text>
);
