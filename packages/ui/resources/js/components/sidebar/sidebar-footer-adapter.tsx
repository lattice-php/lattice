import type { RendererComponent } from "@lattice-php/core/types";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { SidebarFooter } from "./sidebar";

const SidebarFooterAdapter: RendererComponent<"sidebar.footer"> = ({ children, node }) => (
  <SidebarFooter data-lattice-component={nodeIdentity(node)}>{children}</SidebarFooter>
);

export default SidebarFooterAdapter;
