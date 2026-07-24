import { Icon } from "@lattice-php/lattice/icons";
import type { ReactNode } from "react";
import type { Variant } from "@lattice-php/lattice/types/generated";

export const variantStyles: Record<Variant, { accent: string; icon: ReactNode }> = {
  primary: {
    accent: "border-l-lt-primary",
    icon: <Icon name="info" className="size-lt-icon-lg shrink-0 text-lt-primary" />,
  },
  secondary: {
    accent: "border-l-lt-secondary",
    icon: <Icon name="info" className="size-lt-icon-lg shrink-0 text-lt-muted-fg" />,
  },
  success: {
    accent: "border-l-lt-success",
    icon: <Icon name="circle-check" className="size-lt-icon-lg shrink-0 text-lt-success" />,
  },
  info: {
    accent: "border-l-lt-info",
    icon: <Icon name="info" className="size-lt-icon-lg shrink-0 text-lt-info" />,
  },
  warning: {
    accent: "border-l-lt-warning",
    icon: <Icon name="circle-alert" className="size-lt-icon-lg shrink-0 text-lt-warning" />,
  },
  danger: {
    accent: "border-l-lt-danger",
    icon: <Icon name="circle-x" className="size-lt-icon-lg shrink-0 text-lt-danger" />,
  },
};
