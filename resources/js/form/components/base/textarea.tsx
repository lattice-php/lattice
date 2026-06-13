import * as React from "react";

import { cn } from "@lattice-php/lattice/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-lt-input placeholder:text-lt-muted-fg flex field-sizing-content min-h-16 w-full rounded-lt-sm border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-lt-danger/20 dark:aria-invalid:ring-lt-danger/40 aria-invalid:border-lt-danger",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
