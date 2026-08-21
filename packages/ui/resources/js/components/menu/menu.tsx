import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export type NavMenuProps = ComponentProps<"nav"> & {
  listClassName?: string;
};

/**
 * A vertical navigation list. Children are `NavMenuItem`s (or any `<li>`).
 */
export function NavMenu({ children, listClassName, ...props }: NavMenuProps) {
  return (
    <nav {...props}>
      <ul className={cn("flex flex-col gap-1", listClassName)}>{children}</ul>
    </nav>
  );
}
