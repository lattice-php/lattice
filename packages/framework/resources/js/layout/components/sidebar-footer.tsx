import type { RendererComponent } from "@lattice-php/core/types";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { SidebarFooter } from "@lattice-php/ui/components/sidebar/sidebar";

const SidebarFooterComponent: RendererComponent<"sidebar.footer"> = ({ children, node }) => (
  <SidebarFooter data-lattice-component={nodeIdentity(node)}>{children}</SidebarFooter>
);

export default SidebarFooterComponent;
