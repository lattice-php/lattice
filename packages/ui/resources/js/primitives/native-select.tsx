import * as React from "react";
import type { VariantProps } from "class-variance-authority";

import { Icon } from "../icons";
import { controlSurface } from "../lib/control";
import { cn } from "../lib/utils";

/**
 * A native `<select>` wearing the shared control chrome — for short, fixed
 * option lists (filter operators, boolean/ternary states) where the full
 * Combobox is overkill. `density` matches {@link Input}; defaults to comfortable.
 *
 * The browser pins the native drop-down arrow to the border edge regardless of
 * padding, so the select hides it and draws its own caret aligned with the
 * control's padding, matching the Combobox trigger.
 */
function NativeSelect({
  className,
  density,
  children,
  ref,
  ...props
}: React.ComponentProps<"select"> & VariantProps<typeof controlSurface>) {
  return (
    <span className={cn("relative inline-flex w-full min-w-0", className)}>
      <select
        ref={ref}
        data-slot="native-select"
        className={cn(controlSurface({ density }), "cursor-pointer appearance-none pr-8")}
        {...props}
      >
        {children}
      </select>
      <Icon
        name="chevron-down"
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 size-lt-icon-md -translate-y-1/2 text-lt-muted-fg"
      />
    </span>
  );
}

export { NativeSelect };
