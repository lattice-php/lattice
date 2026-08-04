import { VariantProps } from "class-variance-authority";
import * as React from "react";
/**
 * A compact, resizable icon button — the shared affordance behind toolbar
 * triggers, popover triggers, and inline clear/remove buttons. `ghost` matches
 * `Button emphasis="ghost"` (accent hover) and reacts to `aria-pressed` (toggle)
 * and `data-[state=open]` (a popover trigger). `segmented` joins onto the right
 * of an adjacent input. Size defaults to `sm`; pass `size` to resize.
 */
declare const iconButtonVariants: (
  props?:
    | ({
        emphasis?: "ghost" | "segmented" | null | undefined;
        size?: "xs" | "sm" | "md" | null | undefined;
      } & import("class-variance-authority/types").ClassProp)
    | undefined,
) => string;
export declare function IconButton({
  icon,
  label,
  active,
  size,
  emphasis,
  className,
  children,
  ref,
  ...props
}: Omit<React.ComponentProps<"button">, "aria-pressed"> &
  VariantProps<typeof iconButtonVariants> & {
    /** Icon glyph name; omit and pass `children` for custom content. */
    icon?: string;
    /** Accessible name (also used when the button shows only an icon). */
    label: string;
    /** Toggle state — sets `aria-pressed` and the pressed styling. */
    active?: boolean;
  }): React.JSX.Element;
export { iconButtonVariants };
