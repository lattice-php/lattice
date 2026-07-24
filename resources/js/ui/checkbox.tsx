import { Icon } from "@lattice-php/lattice/icons";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as React from "react";

import { cn } from "@lattice-php/lattice/lib/utils";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-lt-input data-[state=checked]:bg-lt-primary data-[state=checked]:text-lt-primary-fg data-[state=checked]:border-lt-primary focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 aria-invalid:ring-lt-danger/20 dark:aria-invalid:ring-lt-danger/40 aria-invalid:border-lt-danger size-4 shrink-0 rounded-lt-xs border shadow-lt-xs transition-shadow outline-none focus-visible:ring-[length:var(--lt-ring-width)] disabled:cursor-not-allowed disabled:bg-lt-disabled disabled:text-lt-disabled-fg disabled:data-[state=checked]:bg-lt-disabled disabled:data-[state=checked]:text-lt-disabled-fg disabled:data-[state=checked]:border-lt-disabled",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <Icon name="check" className="size-lt-icon-sm" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
