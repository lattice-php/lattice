import { cn } from "./lib/utils.js";
import { controlSurface } from "./control.js";
import "react";
import { jsx } from "react/jsx-runtime";
//#region resources/js/native-select.tsx
/**
* A native `<select>` wearing the shared control chrome — for short, fixed
* option lists (filter operators, boolean/ternary states) where the full
* Combobox is overkill. `density` matches {@link Input}; defaults to comfortable.
*/
function NativeSelect({ className, density, children, ref, ...props }) {
	return /* @__PURE__ */ jsx("select", {
		ref,
		"data-slot": "native-select",
		className: cn(controlSurface({ density }), "cursor-pointer", className),
		...props,
		children
	});
}
//#endregion
export { NativeSelect };

//# sourceMappingURL=native-select.js.map