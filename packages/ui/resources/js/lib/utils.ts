import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The sprite renderer always applies `size-lt-icon-md` as a baseline, and these
// custom utilities are invisible to tailwind-merge's stock config, so an explicit
// `size-lt-icon-*` would otherwise be left to fight the baseline on source order.
// Registering them as one conflicting group lets the explicit size always win.
const twMerge = extendTailwindMerge<"lt-icon-size">({
  extend: {
    classGroups: {
      "lt-icon-size": [
        { size: [{ lt: [{ icon: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] }] }] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
