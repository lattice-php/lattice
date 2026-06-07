import type { LatticeRendererComponent } from "@/lattice/core/types";

const TableComponent: LatticeRendererComponent<"table"> = ({ children, node }) => (
  <div data-lattice-component={node.id} className="overflow-hidden rounded-md border">
    {children}
  </div>
);

export default TableComponent;
