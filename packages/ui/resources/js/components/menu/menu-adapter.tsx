import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Menu } from "./menu";

export const MenuAdapter: RendererComponent<"menu"> = ({ children, node }) => (
  <Menu className={node.props?.class ?? undefined} data-test={nodeIdentity(node)}>
    {children}
  </Menu>
);
