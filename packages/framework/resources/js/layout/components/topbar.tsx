import type { RendererComponent } from "@lattice-php/core/types";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { Topbar } from "@lattice-php/ui/components/topbar/topbar";

const TopbarComponent: RendererComponent<"topbar"> = ({ children, node }) => (
  <Topbar data-lattice-component={nodeIdentity(node)} sticky={node.props.sticky}>
    {children}
  </Topbar>
);

export default TopbarComponent;
