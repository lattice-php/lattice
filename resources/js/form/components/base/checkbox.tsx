import { Icon } from "@lattice/lattice/icons";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as React from "react";

import { cn } from "@lattice/lattice/lib/utils";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-lt-input data-[state=checked]:bg-lt-primary data-[state=checked]:text-lt-primary-fg data-[state=checked]:border-lt-primary focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 aria-invalid:ring-lt-danger/20 dark:aria-invalid:ring-lt-danger/40 aria-invalid:border-lt-danger size-4 shrink-0 rounded-lt-xs border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <Icon name="check" className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
