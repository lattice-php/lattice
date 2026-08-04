import { cn } from "./lib/utils.js";
import { jsx } from "react/jsx-runtime";
//#region resources/js/input-error.tsx
function InputError({ message, className = "", ...props }) {
	return message ? /* @__PURE__ */ jsx("p", {
		...props,
		className: cn("text-sm text-lt-danger", className),
		children: message
	}) : null;
}
//#endregion
export { InputError as default };

//# sourceMappingURL=input-error.js.map