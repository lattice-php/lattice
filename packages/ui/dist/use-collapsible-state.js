import { use_persistent_state_exports } from "./lib/use-persistent-state.js";
import { useCallback } from "react";
//#region resources/js/use-collapsible-state.ts
/**
* Boolean open/collapsed state remembered in `localStorage` as `"true"`/`"false"`.
* Shared by the section, collapsible, and sidebar chrome. Callers resolve
* `rememberState` as `props.rememberState !== false`; the wire prop is always a
* boolean, so the polarity is uniform across all three.
*/
function useCollapsibleState(storageKey, fallback, rememberState) {
	const [value, setValue] = (0, use_persistent_state_exports.usePersistentState)(storageKey, fallback, {
		enabled: rememberState,
		parse: (raw) => raw === "true",
		serialize: String
	});
	return [value, useCallback(() => setValue((current) => !current), [setValue])];
}
//#endregion
export { useCollapsibleState };

//# sourceMappingURL=use-collapsible-state.js.map