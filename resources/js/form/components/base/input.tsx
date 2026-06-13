import * as React from "react";

import { cn } from "@lattice-php/lattice/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-lt-input file:text-lt-fg placeholder:text-lt-muted-fg selection:bg-lt-primary selection:text-lt-primary-fg flex h-9 w-full min-w-0 rounded-lt-sm border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-lt-danger/20 dark:aria-invalid:ring-lt-danger/40 aria-invalid:border-lt-danger",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
