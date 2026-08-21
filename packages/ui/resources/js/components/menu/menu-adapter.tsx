import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { NavMenu } from "./menu";

const MenuAdapter: RendererComponent<"menu"> = ({ children, node }) => (
  <NavMenu data-lattice-component={nodeIdentity(node)}>{children}</NavMenu>
);

export default MenuAdapter;
