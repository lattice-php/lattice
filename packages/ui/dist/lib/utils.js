import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
//#region resources/js/lib/utils.ts
var twMerge = extendTailwindMerge({ extend: { classGroups: { "lt-icon-size": [{ size: [{ lt: [{ icon: [
	"xs",
	"sm",
	"md",
	"lg",
	"xl",
	"2xl",
	"3xl",
	"4xl"
] }] }] }] } } });
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
export { cn };

//# sourceMappingURL=utils.js.map