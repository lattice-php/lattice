import type { ComponentProps } from "react";
import type { Align, Gap, Height, Justify, Side, StackDirection, Width } from "../../generated";
import { justifyClasses } from "../../lib/justify";
import { useStickyOffsetPublisher } from "../../lib/use-sticky-offset";
import { cn } from "../../lib/utils";

export type StackProps = Omit<ComponentProps<"div">, "align"> & {
  align?: Align;
  direction?: StackDirection;
  float?: Side;
  gap?: Gap;
  height?: Height;
  justify?: Justify;
  sticky?: boolean;
  width?: Width;
};

const gridAlignments: Record<Align, string> = {
  center: "justify-items-center text-center",
  start: "justify-items-start text-left",
  stretch: "justify-items-stretch",
};

const flexAlignments: Record<Align, string> = {
  center: "items-center text-center",
  start: "items-center text-left",
  stretch: "items-stretch justify-stretch",
};

export const stackGaps: Record<Gap, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

const stackWidths: Record<Width, string> = {
  full: "w-full",
  auto: "w-auto",
  sm: "mx-auto w-full max-w-md",
  md: "mx-auto w-full max-w-2xl",
  lg: "mx-auto w-full max-w-4xl",
  xl: "mx-auto w-full max-w-6xl",
  fill: "min-w-0 flex-1",
};

const stackHeights: Record<Height, string> = {
  full: "h-full",
  screen: "min-h-screen",
};

const floatClasses: Record<Side, string> = {
  start: "mr-auto",
  end: "ml-auto",
};

/**
 * The vertical padding only shows once the stack is stuck — the negative
 * margin cancels it in normal flow — so the pinned content keeps a gutter
 * between itself and the chrome above without shifting the page.
 */
const stickyClasses =
  "sticky top-[var(--lt-sticky-own-top,var(--lt-sticky-offset))] z-lt-sticky -my-4 bg-lt-bg py-4";

export function Stack({
  align = "stretch",
  className,
  direction = "column",
  float,
  gap = "md",
  height,
  justify,
  sticky = false,
  width = "full",
  ...props
}: StackProps) {
  const isFlex = direction === "row" || justify !== undefined;
  const ref = useStickyOffsetPublisher(sticky);

  return (
    <div
      data-slot="stack"
      data-sticky={sticky || undefined}
      ref={ref}
      className={cn(
        isFlex ? cn("flex", direction === "row" ? "flex-wrap" : "flex-col") : "grid content-start",
        isFlex ? flexAlignments[align] : gridAlignments[align],
        stackGaps[gap],
        stackWidths[width],
        justify ? justifyClasses[justify] : null,
        height ? stackHeights[height] : null,
        float ? floatClasses[float] : null,
        sticky && stickyClasses,
        className,
      )}
      {...props}
    />
  );
}
