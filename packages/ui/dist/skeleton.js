import { cn } from "./lib/utils.js";
import "react";
import { jsx } from "react/jsx-runtime";
//#region resources/js/skeleton.tsx
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"aria-hidden": "true",
		className: cn("animate-pulse rounded-lt-sm bg-lt-muted", className),
		"data-slot": "skeleton",
		...props
	});
}
//#endregion
export { Skeleton };

//# sourceMappingURL=skeleton.js.map