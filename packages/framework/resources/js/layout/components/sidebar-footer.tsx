import type { RendererComponent } from "@lattice-php/core/types";
import { nodeIdentity } from "@lattice-php/core/test-id";

const SidebarFooterComponent: RendererComponent<"sidebar.footer"> = ({ children, node }) => (
  <div className="mt-auto flex flex-col gap-4" data-lattice-component={nodeIdentity(node)}>
    {children}
  </div>
);

export default SidebarFooterComponent;
