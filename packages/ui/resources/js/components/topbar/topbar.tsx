import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export type TopbarProps = ComponentProps<"header"> & {
  sticky?: boolean;
};

export function Topbar({ className, sticky = false, ...props }: TopbarProps) {
  return (
    <header
      {...props}
      className={cn(
        "flex h-(--lt-topbar-h) w-full items-center gap-2 border-b border-lt-border bg-lt-bg px-4 text-lt-fg",
        sticky && "sticky top-0 z-lt-sticky",
        className,
      )}
      data-lattice-topbar=""
      data-sticky={sticky || undefined}
    />
  );
}
