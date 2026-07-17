import { cn } from "@lattice-php/lattice/lib/utils";

/** Shared pill styling for the tabs strip and the segmented control. */
export function pillClassName(active: boolean): string {
  return cn(
    "whitespace-nowrap rounded-lt-sm px-3 py-1.5 text-sm font-medium transition-colors",
    active
      ? "bg-lt-bg text-lt-fg shadow-lt-xs"
      : "text-lt-muted-fg hover:bg-lt-bg/60 hover:text-lt-fg",
  );
}
