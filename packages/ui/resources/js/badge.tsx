import * as React from "react";
import { cn } from "@lattice-php/ui/lib/utils";
import { coerceColor, namedColor, toneProps } from "@lattice-php/ui/lib/color";
import type { Color, Node } from "@lattice-php/core/generated";

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

const BadgeComponent = ({ node }: { node: Node<"badge"> }) => (
  <Badge color={node.props.color}>{node.props.label}</Badge>
);

export default BadgeComponent;
export { Badge };
