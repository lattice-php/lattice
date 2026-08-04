import { cn } from "./lib/utils.js";
import { Icon } from "./icons/sprite.js";
import "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
//#region resources/js/icon-button.tsx
/**
* A compact, resizable icon button — the shared affordance behind toolbar
* triggers, popover triggers, and inline clear/remove buttons. `ghost` matches
* `Button emphasis="ghost"` (accent hover) and reacts to `aria-pressed` (toggle)
* and `data-[state=open]` (a popover trigger). `segmented` joins onto the right
* of an adjacent input. Size defaults to `sm`; pass `size` to resize.
*/
var iconButtonVariants = cva(cn("relative inline-flex shrink-0 items-center justify-center rounded-lt-sm transition-colors", "outline-none focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-lt-ring/50", "disabled:pointer-events-none disabled:bg-lt-disabled disabled:text-lt-disabled-fg"), {
	variants: {
		emphasis: {
			ghost: cn("text-lt-muted-fg hover:bg-lt-accent hover:text-lt-accent-fg", "data-[state=open]:bg-lt-accent data-[state=open]:text-lt-accent-fg", "aria-pressed:bg-lt-accent aria-pressed:text-lt-accent-fg"),
			segmented: cn("-ml-px rounded-l-none border border-lt-input text-lt-muted-fg hover:bg-lt-accent hover:text-lt-accent-fg", "data-[state=open]:z-10 data-[state=open]:border-lt-primary data-[state=open]:text-lt-fg")
		},
		size: {
			xs: "size-5 [&_svg]:size-lt-icon-sm",
			sm: "size-7 [&_svg]:size-lt-icon-md",
			md: "size-lt-control-md [&_svg]:size-lt-icon-md"
		}
	},
	defaultVariants: {
		emphasis: "ghost",
		size: "sm"
	}
});
function IconButton({ icon, label, active, size, emphasis, className, children, ref, ...props }) {
	return /* @__PURE__ */ jsxs("button", {
		ref,
		type: "button",
		"aria-label": label,
		"aria-pressed": active,
		className: cn(iconButtonVariants({
			emphasis,
			size
		}), className),
		...props,
		children: [icon ? /* @__PURE__ */ jsx(Icon, {
			name: icon,
			"aria-hidden": "true"
		}) : null, children]
	});
}
//#endregion
export { IconButton, iconButtonVariants };

//# sourceMappingURL=icon-button.js.map