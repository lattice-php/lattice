import { getNumberProp } from "@lattice/core/props";
import type { RendererComponent } from "@lattice/core/types";
import { cn } from "@lattice/lib/utils";

declare module "@lattice/core/types" {
  interface ComponentProps {
    grid: {
      columns?: number;
    };
  }
}

const GridComponent: RendererComponent<"grid"> = ({ children, node }) => {
  const columns = Math.min(Math.max(getNumberProp(node.props, "columns", 1), 1), 4);

  return (
    <div
      data-lattice-component={node.id}
      className={cn(
        "grid gap-4",
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
