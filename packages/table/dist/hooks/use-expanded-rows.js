import { useCallback, useState } from "react";
//#region resources/js/hooks/use-expanded-rows.ts
/**
* Client-side expansion state for expandable table rows, keyed by row key.
* In-memory only: expansions reset when the table reloads or refetches.
*/
function useExpandedRows() {
	const [expanded, setExpanded] = useState(() => /* @__PURE__ */ new Set());
	return {
		isExpanded: useCallback((key) => expanded.has(key), [expanded]),
		toggle: useCallback((key) => {
			setExpanded((current) => {
				const next = new Set(current);
				if (next.has(key)) next.delete(key);
				else next.add(key);
				return next;
			});
		}, [])
	};
}
//#endregion
export { useExpandedRows };

//# sourceMappingURL=use-expanded-rows.js.map