import { createContext, useContext } from "react";
//#region resources/js/collapsed-context.ts
var CollapsedContext = createContext(false);
function useCollapsed() {
	return useContext(CollapsedContext);
}
//#endregion
export { CollapsedContext, useCollapsed };

//# sourceMappingURL=collapsed-context.js.map