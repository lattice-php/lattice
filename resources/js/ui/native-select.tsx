import * as React from "react";
import type { VariantProps } from "class-variance-authority";

import { controlSurface } from "@lattice-php/lattice/ui/control";
import { cn } from "@lattice-php/lattice/lib/utils";

/**
 * A native `<select>` wearing the shared control chrome — for short, fixed
 * option lists (filter operators, boolean/ternary states) where the full
 * Combobox is overkill. `density` matches {@link Input}; defaults to comfortable.
 */
function NativeSelect({
  className,
  density,
  children,
  ref,
  ...props
}: React.ComponentProps<"select"> & VariantProps<typeof controlSurface>) {
  return (
    <select
      ref={ref}
      data-slot="native-select"
      className={cn(controlSurface({ density }), "cursor-pointer", className)}
      {...props}
    >
      {children}
    </select>
  );
}

export { NativeSelect };
