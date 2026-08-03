import { VariantProps } from "class-variance-authority";
import * as React from "react";
export type Emphasis = "solid" | "outline" | "ghost" | "link";
export type Variant = "primary" | "secondary" | "success" | "info" | "warning" | "danger";
declare const buttonVariants: (
  props?:
    | ({
        emphasis?: "link" | "solid" | "outline" | "ghost" | null | undefined;
        variant?:
          | "primary"
          | "secondary"
          | "success"
          | "info"
          | "warning"
          | "danger"
          | null
          | undefined;
        size?: "icon" | "sm" | "md" | "lg" | null | undefined;
      } & import("class-variance-authority/types").ClassProp)
    | undefined,
) => string;
declare function Button({
  className,
  variant,
  emphasis,
  size,
  asChild,
  icon,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Leading icon glyph. Ignored with `asChild` (Slot needs a single child). */
    icon?: string;
  }): React.JSX.Element;
export { Button, buttonVariants };
