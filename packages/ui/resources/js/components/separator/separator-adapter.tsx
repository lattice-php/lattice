import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Separator } from "./separator";

const SeparatorAdapter: RendererComponent<"separator"> = ({ node }) => (
  <Separator
    bleed={node.props.bleed}
    data-test={nodeIdentity(node)}
    orientation={node.props.orientation}
  />
);

export default SeparatorAdapter;
