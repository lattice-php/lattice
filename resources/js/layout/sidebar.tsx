import type { RendererComponent } from "@lattice/lattice/core/types";

const SidebarComponent: RendererComponent<"sidebar"> = ({ children, node }) => (
  <aside
    className="flex w-64 shrink-0 flex-col gap-4 border-r border-lt-border p-4"
    data-lattice-component={node.id}
  >
    {children}
  </aside>
);

export default SidebarComponent;
