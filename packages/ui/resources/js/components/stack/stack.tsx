import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export type StackAlign = "center" | "left" | "start" | "stretch";
export type StackDirection = "column" | "row";
export type StackGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type StackHeight = "full" | "screen";
export type StackJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
export type StackSide = "start" | "end";
export type StackWidth = "full" | "auto" | "sm" | "md" | "lg" | "fill";

export type StackProps = Omit<ComponentProps<"div">, "align"> & {
  align?: StackAlign;
  direction?: StackDirection;
  float?: StackSide;
  gap?: StackGap;
  height?: StackHeight;
  justify?: StackJustify;
  width?: StackWidth;
};

const gridAlignments: Partial<Record<StackAlign, string>> = {
  center: "justify-items-center text-center",
  start: "justify-items-start text-left",
  stretch: "justify-items-stretch",
};

const flexAlignments: Partial<Record<StackAlign, string>> = {
  center: "items-center text-center",
  start: "items-center text-left",
  stretch: "items-stretch justify-stretch",
};

const stackGaps: Record<StackGap, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

const stackWidths: Record<StackWidth, string> = {
  full: "w-full",
  auto: "w-auto",
  sm: "mx-auto w-full max-w-md",
  md: "mx-auto w-full max-w-2xl",
  lg: "mx-auto w-full max-w-4xl",
  fill: "min-w-0 flex-1",
};

const justifyClasses: Record<StackJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

const stackHeights: Record<StackHeight, string> = {
  full: "h-full",
  screen: "min-h-screen",
};

const floatClasses: Record<StackSide, string> = {
  start: "mr-auto",
  end: "ml-auto",
};

export function Stack({
  align = "stretch",
  className,
  direction = "column",
  float,
  gap = "md",
  height,
  justify,
  width = "full",
  ...props
}: StackProps) {
  const isFlex = direction === "row" || justify !== undefined;

  return (
    <div
      data-slot="stack"
      className={cn(
        isFlex ? cn("flex", direction === "row" ? "flex-wrap" : "flex-col") : "grid content-start",
        isFlex
          ? (flexAlignments[align] ?? flexAlignments.stretch)
          : (gridAlignments[align] ?? gridAlignments.stretch),
        stackGaps[gap],
        stackWidths[width],
        justify ? justifyClasses[justify] : null,
        height ? stackHeights[height] : null,
        float ? floatClasses[float] : null,
        className,
      )}
      {...props}
    />
  );
}
