import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";

export const RawBlockAdapter: RendererComponent<"raw-block"> = ({ node }) => (
  <span
    data-test={nodeIdentity(node)}
    style={{ display: "contents" }}
    dangerouslySetInnerHTML={{ __html: node.props.html }}
  />
);
