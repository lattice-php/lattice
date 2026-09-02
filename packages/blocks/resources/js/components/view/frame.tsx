import type { ReactNode } from "react";
import { cn } from "@lattice-php/ui/lib/utils";
import type { BlockStyle } from "../../types";
import { frameInnerClasses, frameOuterClasses } from "../../lib/style-classes";

export type FrameProps = {
  style: BlockStyle;
  children: ReactNode;
  className?: string;
};

/** Applies a block's generic style around its rendered content. */
export function Frame({ style, children, className }: FrameProps) {
  return (
    <div
      className={cn("lt-blocks-frame", frameOuterClasses(style), className)}
      id={style.anchor ?? undefined}
    >
      <div className={frameInnerClasses(style)}>{children}</div>
    </div>
  );
}
