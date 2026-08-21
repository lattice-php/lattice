import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";

const RawBlockAdapter: RendererComponent<"raw-block"> = ({ node }) => (
  <span
    data-lattice-component={nodeIdentity(node)}
    style={{ display: "contents" }}
    dangerouslySetInnerHTML={{ __html: node.props.html }}
  />
);

export default RawBlockAdapter;
