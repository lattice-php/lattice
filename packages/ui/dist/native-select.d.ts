import { VariantProps } from 'class-variance-authority';
import { controlSurface } from './control.js';
import * as React from "react";
/**
 * A native `<select>` wearing the shared control chrome — for short, fixed
 * option lists (filter operators, boolean/ternary states) where the full
 * Combobox is overkill. `density` matches {@link Input}; defaults to comfortable.
 */
declare function NativeSelect({ className, density, children, ref, ...props }: React.ComponentProps<"select"> & VariantProps<typeof controlSurface>): React.JSX.Element;
export { NativeSelect };
