import type { RendererComponent } from "@lattice/lattice/core/types";

const MenuComponent: RendererComponent<"menu"> = ({ children, node }) => (
  <nav data-lattice-component={node.id}>
    <ul className="flex flex-col gap-1">{children}</ul>
  </nav>
);

export default MenuComponent;
