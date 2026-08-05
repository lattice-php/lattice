import type { RendererComponent } from "@lattice-php/core/types";
import { nodeIdentity } from "@lattice-php/core/test-id";

const MenuComponent: RendererComponent<"menu"> = ({ children, node }) => (
  <nav data-lattice-component={nodeIdentity(node)}>
    <ul className="flex flex-col gap-1">{children}</ul>
  </nav>
);

export default MenuComponent;
