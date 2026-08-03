import { cn } from "./lib/utils.js";
import { jsx } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
//#region resources/js/text-link.tsx
function TextLink({ className = "", children, ...props }) {
	return /* @__PURE__ */ jsx(Link, {
		className: cn("text-lt-fg underline decoration-lt-border underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-lt-border", className),
		...props,
		children
	});
}
//#endregion
export { TextLink };

//# sourceMappingURL=text-link.js.map