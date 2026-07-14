import * as React from "react";
import type { VariantProps } from "class-variance-authority";

import { controlSurface } from "@lattice-php/lattice/ui/control";
import { cn } from "@lattice-php/lattice/lib/utils";

function Input({
  className,
  type,
  density,
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof controlSurface>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        controlSurface({ density }),
        "file:text-lt-fg selection:bg-lt-primary selection:text-lt-primary-fg file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
