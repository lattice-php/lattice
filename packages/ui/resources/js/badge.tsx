import type { ComponentProps } from "react";
import { coerceColor, namedColor, toneProps } from "./lib/color";
import { cn } from "./lib/utils";
import type { Color } from "./types";

export function Badge({
  color,
  className,
  style,
  ...props
}: Omit<ComponentProps<"span">, "color"> & { color?: Color | string | null }) {
  const tone = toneProps(coerceColor(color ?? undefined) ?? namedColor("gray"));

  return (
    <span
      data-slot="badge"
      className={cn("lt-badge", tone.className, className)}
      style={{ ...tone.style, ...style }}
      {...props}
    />
  );
}
