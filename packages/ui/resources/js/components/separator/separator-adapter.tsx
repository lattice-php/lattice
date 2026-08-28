import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Separator } from "./separator";

export const SeparatorAdapter: RendererComponent<"separator"> = ({ node }) => (
  <Separator
    bleed={node.props.bleed}
    className={node.props.class ?? undefined}
    data-test={nodeIdentity(node)}
    orientation={node.props.orientation}
  />
);
