import { cva, type VariantProps } from "class-variance-authority";

export const FOCUS_RING =
  "focus-visible:border-lt-ring focus-visible:ring-lt-ring/50 focus-visible:ring-[3px]";

/**
 * The shared chrome for single-line form/table controls (text inputs, native
 * selects, and the Select/filter trigger buttons). `density` is the only axis
 * that differs between forms (comfortable) and table filters (compact); the
 * border, focus ring, invalid, and disabled treatment are unified.
 */
export const controlSurface = cva(
  [
    "w-full min-w-0 rounded-lt-sm border border-lt-input shadow-lt-xs outline-none transition-[color,box-shadow]",
    "placeholder:text-lt-muted-fg",
    FOCUS_RING,
    "aria-invalid:border-lt-danger aria-invalid:ring-lt-danger/20 dark:aria-invalid:ring-lt-danger/40",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-lt-disabled disabled:text-lt-disabled-fg",
  ],
  {
    variants: {
      density: {
        comfortable: "h-lt-control-md bg-transparent px-3 py-1 text-base",
        compact: "h-lt-control-md bg-lt-bg px-2 text-sm font-normal",
      },
    },
    defaultVariants: { density: "comfortable" },
  },
);

export type ControlSurfaceVariants = VariantProps<typeof controlSurface>;
