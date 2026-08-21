import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export type MenuProps = ComponentProps<"nav"> & {
  listClassName?: string;
};

/**
 * A vertical navigation list. Children are `MenuItem`s (or any `<li>`).
 */
export function Menu({ children, listClassName, ...props }: MenuProps) {
  return (
    <nav {...props}>
      <ul className={cn("flex flex-col gap-1", listClassName)}>{children}</ul>
    </nav>
  );
}
