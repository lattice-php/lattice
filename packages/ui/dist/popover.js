import { cn } from "./lib/utils.js";
import "react";
import { jsx } from "react/jsx-runtime";
import * as PopoverPrimitive from "@radix-ui/react-popover";
//#region resources/js/popover.tsx
var POPOVER_SURFACE = "z-lt-popover rounded-lt-sm border border-lt-border bg-lt-popover text-lt-popover-fg shadow-lt-md";
function Popover(props) {
	return /* @__PURE__ */ jsx(PopoverPrimitive.Root, {
		"data-slot": "popover",
		...props
	});
}
function PopoverTrigger(props) {
	return /* @__PURE__ */ jsx(PopoverPrimitive.Trigger, {
		"data-slot": "popover-trigger",
		...props
	});
}
function PopoverClose(props) {
	return /* @__PURE__ */ jsx(PopoverPrimitive.Close, {
		"data-slot": "popover-close",
		...props
	});
}
function PopoverContent({ align = "start", className, sideOffset = 4, ...props }) {
	return /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(PopoverPrimitive.Content, {
		align,
		className: cn(POPOVER_SURFACE, className),
		"data-slot": "popover-content",
		sideOffset,
		...props
	}) });
}
//#endregion
export { POPOVER_SURFACE, Popover, PopoverClose, PopoverContent, PopoverTrigger };

//# sourceMappingURL=popover.js.map