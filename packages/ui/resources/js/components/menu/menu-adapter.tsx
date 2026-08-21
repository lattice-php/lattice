import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { Menu } from "./menu";

const MenuAdapter: RendererComponent<"menu"> = ({ children, node }) => (
  <Menu data-lattice-component={nodeIdentity(node)}>{children}</Menu>
);

export default MenuAdapter;
