import { getNumberProp } from "@lattice/lattice/core/props";
import type { RendererComponent } from "@lattice/lattice/core/types";
import { cn } from "@lattice/lattice/lib/utils";

const GridComponent: RendererComponent<"grid"> = ({ children, node }) => {
  const columns = Math.min(Math.max(getNumberProp(node.props, "columns", 1), 1), 4);

  return (
    <div
      data-lattice-component={node.id}
      className={cn(
        "grid gap-x-4 gap-y-6",
        columns >= 2 && "md:grid-cols-2",
        columns >= 3 && "lg:grid-cols-3",
        columns >= 4 && "xl:grid-cols-4",
      )}
    >
      {children}
    </div>
  );
};

export default GridComponent;
