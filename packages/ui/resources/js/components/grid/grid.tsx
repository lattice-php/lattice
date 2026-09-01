import type { ComponentProps, CSSProperties } from "react";
import type { Breakpoint } from "../../types";
import { cn } from "../../lib/utils";

export type GridBreakpointMap = Partial<Record<Breakpoint, number | string>>;

export type GridProps = ComponentProps<"div"> & {
  columns?: GridBreakpointMap;
};

export type GridItemProps = ComponentProps<"div"> & {
  columnSpan?: GridBreakpointMap;
};

function breakpointVars(
  map: GridBreakpointMap | undefined,
  prefix: string,
  toValue: (value: number | string) => string,
): CSSProperties | undefined {
  const entries = Object.entries(map ?? {});

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(
    entries.map(([breakpoint, value]) => [`${prefix}-${breakpoint}`, toValue(value)]),
  ) as CSSProperties;
}

const trackList = (value: number | string): string =>
  typeof value === "number" ? `repeat(${value}, minmax(0, 1fr))` : value;

const gridColumn = (value: number | string): string =>
  value === "full" ? "1 / -1" : `span ${value} / span ${value}`;

export function Grid({ className, columns, style, ...props }: GridProps) {
  return (
    <div
      data-slot="grid"
      className={cn("lt-grid grid gap-x-4 gap-y-6", className)}
      style={{ ...style, ...breakpointVars(columns, "--lt-grid-cols", trackList) }}
      {...props}
    />
  );
}

export function GridItem({ className, columnSpan, style, ...props }: GridItemProps) {
  return (
    <div
      data-slot="grid-item"
      className={className}
      style={{ ...style, ...breakpointVars(columnSpan, "--lt-col-span", gridColumn) }}
      {...props}
    />
  );
}
