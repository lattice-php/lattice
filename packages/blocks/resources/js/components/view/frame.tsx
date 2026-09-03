import type { ReactNode } from "react";
import { cn } from "@lattice-php/ui/lib/utils";
import type { FrameClasses } from "../../types";

export type FrameProps = {
  classes: FrameClasses;
  anchor?: string | null;
  children: ReactNode;
  className?: string;
};

/** Applies a block's resolved style classes around its rendered content. */
export function Frame({ classes, anchor, children, className }: FrameProps) {
  return (
    <div className={cn("lt-blocks-frame", classes.outer, className)} id={anchor ?? undefined}>
      <div className={classes.inner}>{children}</div>
    </div>
  );
}
