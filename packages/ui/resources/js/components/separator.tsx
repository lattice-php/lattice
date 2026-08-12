import type { RendererComponent } from "@lattice-php/core/types";
import { cn } from "../lib/utils";

const SeparatorComponent: RendererComponent<"separator"> = ({ node }) => {
  const horizontal = node.props.orientation === "horizontal";
  const bleed = node.props.bleed;

  return (
    <div
      role="separator"
      aria-orientation={node.props.orientation}
      data-bleed={bleed ? "" : undefined}
      className={cn(
        "shrink-0 bg-lt-border",
        horizontal ? "h-px w-full" : "h-full w-px self-stretch",
        bleed && (horizontal ? "-mx-lt-gutter w-auto" : "-my-lt-gutter h-auto"),
      )}
    />
  );
};

export default SeparatorComponent;
