import { getStringProp } from "@bambamboole/lattice/core/props";
import type { RendererComponent } from "@bambamboole/lattice/core/types";
import { cn } from "@bambamboole/lattice/lib/utils";

declare module "@bambamboole/lattice/core/types" {
  interface ComponentProps {
    stack: {
      align?: string;
      direction?: string;
      gap?: string;
      width?: string;
    };
  }
}

const gridAlignments: Record<string, string> = {
  center: "justify-items-center text-center",
  start: "justify-items-start text-left",
  stretch: "justify-items-stretch",
};

const flexAlignments: Record<string, string> = {
  center: "items-center justify-center text-center",
  start: "items-center justify-start text-left",
  stretch: "items-stretch justify-stretch",
};

const stackGaps: Record<string, string> = {
  xs: "gap-1",
  lg: "gap-6",
  md: "gap-4",
  sm: "gap-2",
  xl: "gap-8",
};

const stackWidths: Record<string, string> = {
  full: "w-full",
  lg: "mx-auto w-full max-w-4xl",
  md: "mx-auto w-full max-w-2xl",
  sm: "mx-auto w-full max-w-md",
};

const StackComponent: RendererComponent<"stack"> = ({ children, node }) => {
  const align = getStringProp(node.props, "align", "stretch");
  const direction = getStringProp(node.props, "direction", "column");
  const gap = getStringProp(node.props, "gap", "md");
  const width = getStringProp(node.props, "width", "full");

  if (direction === "row") {
    return (
      <div
        data-lattice-component={node.id}
        className={cn(
          "flex flex-wrap",
          flexAlignments[align] ?? flexAlignments.stretch,
          stackGaps[gap] ?? stackGaps.md,
          stackWidths[width] ?? stackWidths.full,
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      data-lattice-component={node.id}
      className={cn(
        "grid",
        gridAlignments[align] ?? gridAlignments.stretch,
        stackGaps[gap] ?? stackGaps.md,
        stackWidths[width] ?? stackWidths.full,
      )}
    >
      {children}
    </div>
  );
};

export default StackComponent;
