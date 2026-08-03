import { cn } from "./lib/utils.js";
import { Icon } from "./icons/sprite.js";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "./popover.js";
import "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/dropdown-menu.tsx
function DropdownMenu(props) {
	return /* @__PURE__ */ jsx(Popover, { ...props });
}
function DropdownMenuTrigger(props) {
	return /* @__PURE__ */ jsx(PopoverTrigger, { ...props });
}
function DropdownMenuContent({ className, ...props }) {
	return /* @__PURE__ */ jsx(PopoverContent, {
		className: cn("grid min-w-40 gap-1 p-1", className),
		role: "menu",
		...props
	});
}
/**
* A menu entry that closes the menu when activated. Wrap the click handler in
* `onClick`; selecting the item dismisses the popover via `PopoverClose`.
*/
function DropdownMenuItem({ children, className, danger = false, icon, ...props }) {
	return /* @__PURE__ */ jsx(PopoverClose, {
		asChild: true,
		children: /* @__PURE__ */ jsxs("button", {
			type: "button",
			role: "menuitem",
			className: cn("flex w-full items-center gap-2 rounded-lt-sm px-3 py-1.5 text-left text-sm [&_svg]:size-lt-icon-sm", danger ? "text-lt-danger hover:bg-lt-danger/10" : "hover:bg-lt-accent hover:text-lt-accent-fg", className),
			...props,
			children: [icon ? /* @__PURE__ */ jsx(Icon, {
				name: icon,
				"aria-hidden": "true"
			}) : null, children]
		})
	});
}
//#endregion
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger };

//# sourceMappingURL=dropdown-menu.js.map