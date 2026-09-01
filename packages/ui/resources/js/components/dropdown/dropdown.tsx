import { useEffect, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { CollapsedProvider } from "@lattice-php/core/collapsed-context";
import type { ContentAlign, Placement } from "../../generated";
import { cn } from "../../lib/utils";
import { useNavigation } from "../../navigation";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";

export type DropdownProps = Omit<ComponentProps<"button">, "children" | "type"> & {
  align?: Exclude<ContentAlign, "center">;
  children: ReactNode;
  contentClassName?: string;
  placement?: Placement;
  trigger: ReactNode;
};

/**
 * A navigation menu behind a trigger button: a popover with menu semantics
 * that closes on every navigation reported by the navigation adapter. Its
 * items always render expanded, even inside a collapsed sidebar.
 */
export function Dropdown({
  align = "start",
  children,
  className,
  contentClassName,
  placement = "bottom",
  trigger,
  ...props
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const { onNavigate } = useNavigation();

  useEffect(() => onNavigate(() => setOpen(false)), [onNavigate]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button {...props} className={cn("w-full", className)} type="button">
          {trigger}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn("min-w-56 p-1", contentClassName)}
        role="menu"
        side={placement}
      >
        <CollapsedProvider collapsed={false}>{children}</CollapsedProvider>
      </PopoverContent>
    </Popover>
  );
}
