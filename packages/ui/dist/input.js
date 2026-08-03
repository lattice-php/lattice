import { cn } from "./lib/utils.js";
import { controlSurface } from "./control.js";
import "react";
import { jsx } from "react/jsx-runtime";
//#region resources/js/input.tsx
function Input({ className, type, density, ...props }) {
	return /* @__PURE__ */ jsx("input", {
		type,
		"data-slot": "input",
		className: cn(controlSurface({ density }), "file:text-lt-fg selection:bg-lt-primary selection:text-lt-primary-fg file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium", className),
		...props
	});
}
//#endregion
export { Input };

//# sourceMappingURL=input.js.map