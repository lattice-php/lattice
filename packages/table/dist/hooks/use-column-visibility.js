import { useCallback, useMemo } from "react";
import { usePersistentState } from "@lattice-php/ui/lib/use-persistent-state";
//#region resources/js/hooks/use-column-visibility.ts
function useColumnVisibility({ columns, storageKey }) {
	const toggleableColumns = useMemo(() => columns.filter((column) => column.props.toggleable), [columns]);
	const toggleableKeys = useMemo(() => toggleableColumns.map((column) => column.key), [toggleableColumns]);
	const [overrides, setOverrides] = usePersistentState(storageKey ?? "", {}, {
		enabled: Boolean(storageKey),
		parse: (raw) => parseStoredVisibility(raw, toggleableKeys),
		serialize: (value) => serializeVisibility(value, toggleableKeys)
	});
	const isVisible = useCallback((column) => {
		if (!column.props.toggleable) return true;
		return overrides[column.key] ?? !column.props.hiddenByDefault;
	}, [overrides]);
	const visibleColumns = useMemo(() => columns.filter((column) => isVisible(column)), [columns, isVisible]);
	const setColumnVisible = useCallback((key, visible) => {
		setOverrides((current) => ({
			...current,
			[key]: visible
		}));
	}, [setOverrides]);
	const resetVisibility = useCallback(() => setOverrides({}), [setOverrides]);
	const hasToggleableColumns = toggleableColumns.length > 0;
	return {
		hasHidden: toggleableColumns.some((column) => !isVisible(column)),
		hasToggleableColumns,
		isVisible,
		resetVisibility,
		setColumnVisible,
		toggleableColumns,
		visibleColumns
	};
}
function pickKnownBooleans(source, toggleableKeys) {
	const known = new Set(toggleableKeys);
	const result = {};
	for (const [key, value] of Object.entries(source)) if (known.has(key) && typeof value === "boolean") result[key] = value;
	return result;
}
function parseStoredVisibility(raw, toggleableKeys) {
	const overrides = JSON.parse(raw)?.overrides;
	if (typeof overrides !== "object" || overrides === null || Array.isArray(overrides)) throw new Error("unexpected stored column visibility shape");
	return pickKnownBooleans(overrides, toggleableKeys);
}
function serializeVisibility(overrides, toggleableKeys) {
	const stored = pickKnownBooleans(overrides, toggleableKeys);
	if (Object.keys(stored).length === 0) return null;
	return JSON.stringify({ overrides: stored });
}
//#endregion
export { useColumnVisibility };

//# sourceMappingURL=use-column-visibility.js.map