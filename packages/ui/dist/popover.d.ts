import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";
export declare const POPOVER_SURFACE = "z-lt-popover rounded-lt-sm border border-lt-border bg-lt-popover text-lt-popover-fg shadow-lt-md";
declare function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>): React.JSX.Element;
declare function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>): React.JSX.Element;
declare function PopoverClose(props: React.ComponentProps<typeof PopoverPrimitive.Close>): React.JSX.Element;
declare function PopoverContent({ align, className, sideOffset, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content>): React.JSX.Element;
export { Popover, PopoverClose, PopoverContent, PopoverTrigger };
