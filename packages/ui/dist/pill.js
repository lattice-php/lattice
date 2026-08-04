import { cn } from "./lib/utils.js";
//#region resources/js/pill.ts
/** Shared pill styling for the tabs strip and the segmented control. */
function pillClassName(active) {
	return cn("whitespace-nowrap rounded-lt-sm px-3 py-1.5 text-sm font-medium transition-colors", active ? "bg-lt-bg text-lt-fg shadow-lt-xs" : "text-lt-muted-fg hover:bg-lt-bg/60 hover:text-lt-fg");
}
//#endregion
export { pillClassName };

//# sourceMappingURL=pill.js.map