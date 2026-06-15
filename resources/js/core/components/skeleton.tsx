import * as React from "react";
import { cn } from "@lattice-php/lattice/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lt-sm bg-lt-muted", className)}
      data-slot="skeleton"
      {...props}
    />
  );
}

export { Skeleton };
