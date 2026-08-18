import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export type SeparatorOrientation = "horizontal" | "vertical";

export type SeparatorProps = Omit<ComponentProps<"div">, "aria-orientation" | "role"> & {
  bleed?: boolean;
  orientation?: SeparatorOrientation;
};

export function Separator({
  bleed = false,
  className,
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  const horizontal = orientation === "horizontal";

  return (
    <div
      {...props}
      role="separator"
      aria-orientation={orientation}
      data-bleed={bleed ? "" : undefined}
      data-slot="separator"
      className={cn(
        "shrink-0 bg-lt-border",
        horizontal ? "h-px w-full" : "h-full w-px self-stretch",
        bleed && (horizontal ? "-mx-lt-gutter w-auto" : "-my-lt-gutter h-auto"),
        className,
      )}
    />
  );
}
