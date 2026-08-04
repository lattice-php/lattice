import type { RendererComponent } from "@lattice-php/core/types";
import { cn } from "@lattice-php/ui/lib/utils";

const SeparatorComponent: RendererComponent<"separator"> = ({ node }) => {
  const horizontal = node.props.orientation === "horizontal";

  return (
    <div
      role="separator"
      aria-orientation={node.props.orientation}
      className={cn(
        "shrink-0 bg-lt-border",
        horizontal ? "h-px w-full" : "h-full w-px self-stretch",
      )}
    />
  );
};

export default SeparatorComponent;
