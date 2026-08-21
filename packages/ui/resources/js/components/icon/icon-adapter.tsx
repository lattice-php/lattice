import { nodeIdentity } from "@lattice-php/core/test-id";
import type { RendererComponent } from "@lattice-php/core/types";
import { IconRenderer } from "../../icons";
import { coerceColor, colorValue } from "../../lib/color";
import { cn } from "../../lib/utils";
import type { Size } from "../../generated";

const sizeClass: Record<Size, string> = {
  xs: "size-lt-icon-xs",
  sm: "size-lt-icon-sm",
  md: "size-lt-icon-md",
  lg: "size-lt-icon-lg",
  xl: "size-lt-icon-xl",
  "2xl": "size-lt-icon-2xl",
  "3xl": "size-lt-icon-3xl",
  "4xl": "size-lt-icon-4xl",
};

const IconAdapter: RendererComponent<"icon"> = ({ node }) => {
  const { name, size, color, class: className } = node.props;
  const coerced = coerceColor(color);

  return (
    <span
      className="contents"
      data-lattice-component={nodeIdentity(node)}
      style={coerced ? { color: colorValue(coerced) } : undefined}
    >
      <IconRenderer icon={name} className={cn(sizeClass[size], className)} />
    </span>
  );
};

export default IconAdapter;
