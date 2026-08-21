import type { RendererComponent } from "@lattice-php/core/types";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { Topbar } from "./topbar";

export const TopbarAdapter: RendererComponent<"topbar"> = ({ children, node }) => (
  <Topbar data-test={nodeIdentity(node)} sticky={node.props.sticky}>
    {children}
  </Topbar>
);
