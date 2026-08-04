import { createContext, useContext } from "react";
//#region resources/js/hooks/prefill-context.ts
var PrefillContext = createContext(null);
var PrefillProvider = PrefillContext.Provider;
function usePrefillController() {
	return useContext(PrefillContext);
}
//#endregion
export { PrefillProvider, usePrefillController };

//# sourceMappingURL=prefill-context.js.map