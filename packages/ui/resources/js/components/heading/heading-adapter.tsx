import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Heading } from "./heading";

const HeadingAdapter: RendererComponent<"heading"> = ({ node }) => (
  <Heading
    copyable={node.props.copyable}
    copyLabel={node.props.text}
    copyValue={node.props.text}
    data-test={nodeIdentity(node)}
    level={node.props.level}
    tooltip={node.props.tooltip}
  >
    {node.props.text}
  </Heading>
);

export default HeadingAdapter;
