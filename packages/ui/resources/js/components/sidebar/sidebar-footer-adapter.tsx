import type { RendererComponent } from "@lattice-php/core/types";
import { nodeIdentity } from "@lattice-php/core/test-id";
import { SidebarFooter } from "./sidebar";

export const SidebarFooterAdapter: RendererComponent<"sidebar.footer"> = ({ children, node }) => (
  <SidebarFooter data-test={nodeIdentity(node)}>{children}</SidebarFooter>
);
