import { cn } from "./lib/utils.js";
import "react";
import { jsx } from "react/jsx-runtime";
import * as LabelPrimitive from "@radix-ui/react-label";
//#region resources/js/label.tsx
function Label({ className, ...props }) {
	return /* @__PURE__ */ jsx(LabelPrimitive.Root, {
		"data-slot": "label",
		className: cn("text-base leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-lt-disabled-fg peer-disabled:cursor-not-allowed peer-disabled:text-lt-disabled-fg", className),
		...props
	});
}
//#endregion
export { Label };

//# sourceMappingURL=label.js.map