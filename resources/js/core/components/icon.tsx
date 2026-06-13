import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { IconRenderer } from "@lattice-php/lattice/icons";
import { cn } from "@lattice-php/lattice/lib/utils";
import type { Color, Size } from "@lattice-php/lattice/types/generated";

const sizeClass: Record<Size, string> = {
  xs: "size-lt-icon-xs",
  sm: "size-lt-icon-sm",
  md: "size-lt-icon-md",
  lg: "size-lt-icon-lg",
  xl: "size-lt-icon-xl",
};

const colorClass: Record<Color, string> = {
  default: "text-lt-fg",
  muted: "text-lt-muted-fg",
  primary: "text-lt-primary",
  success: "text-lt-success",
  info: "text-lt-info",
  warning: "text-lt-warning",
  danger: "text-lt-danger",
};

const IconComponent: RendererComponent<"icon"> = ({ node }) => {
  const { name, size, color, class: className } = node.props;

  return (
    <IconRenderer
      icon={name}
      className={cn(sizeClass[size], color ? colorClass[color] : undefined, className)}
    />
  );
};

export default IconComponent;
