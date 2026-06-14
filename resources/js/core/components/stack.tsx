import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { cn } from "@lattice-php/lattice/lib/utils";

const gridAlignments: Record<string, string> = {
  center: "justify-items-center text-center",
  start: "justify-items-start text-left",
  stretch: "justify-items-stretch",
};

const flexAlignments: Record<string, string> = {
  center: "items-center text-center",
  start: "items-center text-left",
  stretch: "items-stretch justify-stretch",
};

const stackGaps: Record<string, string> = {
  none: "gap-0",
  xs: "gap-1",
  lg: "gap-6",
  md: "gap-4",
  sm: "gap-2",
  xl: "gap-8",
};

const stackWidths: Record<string, string> = {
  fill: "min-w-0 flex-1",
  full: "w-full",
  lg: "mx-auto w-full max-w-4xl",
  md: "mx-auto w-full max-w-2xl",
  sm: "mx-auto w-full max-w-md",
};

const justifyClasses: Record<string, string> = {
  around: "justify-around",
  between: "justify-between",
  center: "justify-center",
  end: "justify-end",
  evenly: "justify-evenly",
  start: "justify-start",
};

const stackHeights: Record<string, string> = {
  full: "h-full",
  screen: "min-h-screen",
};

const StackComponent: RendererComponent<"stack"> = ({ children, node }) => {
  const align = node.props.align ?? "stretch";
  const direction = node.props.direction ?? "column";
  const gap = node.props.gap ?? "md";
  const width = node.props.width ?? "full";
  const justify = node.props.justify;
  const height = node.props.height;
  const isFlex = direction === "row" || justify != null;

  return (
    <div
      data-lattice-component={node.id}
      className={cn(
        isFlex ? cn("flex", direction === "row" ? "flex-wrap" : "flex-col") : "grid content-start",
        isFlex
          ? (flexAlignments[align] ?? flexAlignments.stretch)
          : (gridAlignments[align] ?? gridAlignments.stretch),
        stackGaps[gap] ?? stackGaps.md,
        stackWidths[width] ?? stackWidths.full,
        justify ? justifyClasses[justify] : null,
        height ? stackHeights[height] : null,
      )}
    >
      {children}
    </div>
  );
};

export default StackComponent;
