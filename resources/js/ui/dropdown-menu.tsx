import { Icon } from "@lattice-php/lattice/icons";
import * as React from "react";
import { cn } from "@lattice-php/lattice/lib/utils";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "./popover";

function DropdownMenu(props: React.ComponentProps<typeof Popover>) {
  return <Popover {...props} />;
}

function DropdownMenuTrigger(props: React.ComponentProps<typeof PopoverTrigger>) {
  return <PopoverTrigger {...props} />;
}

function DropdownMenuContent({ className, ...props }: React.ComponentProps<typeof PopoverContent>) {
  return (
    <PopoverContent className={cn("grid min-w-40 gap-1 p-1", className)} role="menu" {...props} />
  );
}

/**
 * A menu entry that closes the menu when activated. Wrap the click handler in
 * `onClick`; selecting the item dismisses the popover via `PopoverClose`.
 */
function DropdownMenuItem({
  children,
  className,
  danger = false,
  icon,
  ...props
}: React.ComponentProps<"button"> & { danger?: boolean; icon?: string }) {
  return (
    <PopoverClose asChild>
      <button
        type="button"
        role="menuitem"
        className={cn(
          "flex w-full items-center gap-2 rounded-lt-sm px-3 py-1.5 text-left text-sm [&_svg]:size-lt-icon-sm",
          danger
            ? "text-lt-danger hover:bg-lt-danger/10"
            : "hover:bg-lt-accent hover:text-lt-accent-fg",
          className,
        )}
        {...props}
      >
        {icon ? <Icon name={icon} aria-hidden="true" /> : null}
        {children}
      </button>
    </PopoverClose>
  );
}

export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger };
