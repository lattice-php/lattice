import { Popover, PopoverContent, PopoverTrigger } from "./popover.js";
import * as React from "react";
declare function DropdownMenu(props: React.ComponentProps<typeof Popover>): React.JSX.Element;
declare function DropdownMenuTrigger(
  props: React.ComponentProps<typeof PopoverTrigger>,
): React.JSX.Element;
declare function DropdownMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof PopoverContent>): React.JSX.Element;
/**
 * A menu entry that closes the menu when activated. Wrap the click handler in
 * `onClick`; selecting the item dismisses the popover via `PopoverClose`.
 */
declare function DropdownMenuItem({
  children,
  className,
  danger,
  icon,
  ...props
}: React.ComponentProps<"button"> & {
  danger?: boolean;
  icon?: string;
}): React.JSX.Element;
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger };
