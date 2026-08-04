import { VariantProps } from "class-variance-authority";
import { controlSurface } from "./control.js";
import * as React from "react";
declare function Input({
  className,
  type,
  density,
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof controlSurface>): React.JSX.Element;
export { Input };
