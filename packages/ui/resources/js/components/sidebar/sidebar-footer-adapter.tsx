import type { RendererComponent } from "@lattice-php/core/types";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { SidebarFooter } from "./sidebar";

export const SidebarFooterAdapter: RendererComponent<"sidebar.footer"> = ({ children, node }) => (
  <SidebarFooter className={node.props?.class ?? undefined} data-test={nodeIdentity(node)}>
    {children}
  </SidebarFooter>
);
