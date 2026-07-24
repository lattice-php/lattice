import * as React from "react";
import { cn } from "@lattice-php/lattice/lib/utils";
import { coerceColor, namedColor, toneProps } from "@lattice-php/lattice/lib/color";
import type { Color } from "@lattice-php/lattice/types/generated";
import type { RendererComponent } from "@lattice-php/lattice/core/types";

function Badge({
  color,
  className,
  style,
  ...props
}: Omit<React.ComponentProps<"span">, "color"> & { color?: Color | string | null }) {
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

const BadgeComponent: RendererComponent<"badge"> = ({ node }) => (
  <Badge color={node.props.color}>{node.props.label}</Badge>
);

export default BadgeComponent;
export { Badge };
