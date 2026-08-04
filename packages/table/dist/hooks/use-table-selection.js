import { useCallback, useEffect, useState } from "react";
//#region resources/js/hooks/use-table-selection.ts
function useTableSelection(keys) {
	const [selected, setSelected] = useState(() => /* @__PURE__ */ new Set());
	const [allMatching, setAllMatching] = useState(false);
	const signature = keys.join(" ");
	useEffect(() => {
		setSelected(/* @__PURE__ */ new Set());
		setAllMatching(false);
	}, [signature]);
	const toggle = useCallback((key) => {
		setAllMatching(false);
		setSelected((current) => {
			const next = new Set(current);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	}, []);
	const toggleAll = useCallback(() => {
		setAllMatching(false);
		setSelected((current) => current.size === keys.length ? /* @__PURE__ */ new Set() : new Set(keys));
	}, [keys]);
	const selectAllMatching = useCallback(() => setAllMatching(true), []);
	const clear = useCallback(() => {
		setAllMatching(false);
		setSelected(/* @__PURE__ */ new Set());
	}, []);
	const selectedKeys = keys.filter((key) => selected.has(key));
	const allVisibleSelected = keys.length > 0 && selectedKeys.length === keys.length;
	return {
		selectedKeys,
		allMatching,
		allVisibleSelected,
		allSelected: allMatching || allVisibleSelected,
		active: allMatching || selectedKeys.length > 0,
		isSelected: (key) => allMatching || selected.has(key),
		toggle,
		toggleAll,
		selectAllMatching,
		clear
	};
}
//#endregion
export { useTableSelection };

//# sourceMappingURL=use-table-selection.js.map