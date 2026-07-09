import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Popover as PopoverRoot,
  PopoverContent,
  PopoverTrigger,
} from "@lattice-php/lattice/ui/popover";
import { cn } from "@lattice-php/lattice/lib/utils";
import { CollapsedContext } from "../../core/collapsed-context";

/**
 * A navigation-aware popover for the sidebar: it wraps the shared popover
 * primitive (so positioning and dismissal stay consistent with the rest of the
 * app) and closes itself on every Inertia navigation. Items render expanded
 * regardless of the sidebar's collapsed state.
 */
export function Popover({
  align = "start",
  children,
  className,
  placement = "bottom",
  testId,
  trigger,
  triggerClassName,
  triggerLabel,
}: {
  align?: "start" | "end";
  children: ReactNode;
  className?: string;
  placement?: "bottom" | "right" | "top";
  testId?: string;
  trigger: ReactNode;
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const url = usePage().url;

  useEffect(() => setOpen(false), [url]);

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={triggerLabel}
          className={cn("w-full", triggerClassName)}
          data-test={testId}
          title={triggerLabel}
          type="button"
        >
          {trigger}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn("min-w-56 p-1", className)}
        role="menu"
        side={placement}
      >
        <CollapsedContext.Provider value={false}>{children}</CollapsedContext.Provider>
      </PopoverContent>
    </PopoverRoot>
  );
}
