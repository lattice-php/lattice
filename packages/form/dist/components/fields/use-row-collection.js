import { duplicateRow, ensureRowIds, moveRow, removeRow, seedRows, withRowId } from "./repeater-rows.js";
import { useCallback } from "react";
import { useLayoutEffect } from "@lattice-php/ui/lib/use-layout-effect";
import { useFieldScope } from "@lattice-php/form/hooks/field-scope";
import { useFormValue, useSetFormValue } from "@lattice-php/form/hooks/values";
//#region resources/js/components/fields/use-row-collection.ts
function useRowCollection(name, defaultItems) {
	const scope = useFieldScope();
	const path = scope ? scope.errorKey(name) : name;
	const setValue = useSetFormValue();
	const stored = useFormValue(path);
	const raw = Array.isArray(stored) ? stored : seedRows(stored, defaultItems);
	const rows = ensureRowIds(raw);
	useLayoutEffect(() => {
		if (rows !== raw) setValue(path, rows);
	}, [
		raw,
		rows,
		setValue,
		path
	]);
	const mutate = useCallback((fn) => {
		setValue(path, (prev) => fn(Array.isArray(prev) ? prev : seedRows(prev, defaultItems)));
	}, [
		setValue,
		path,
		defaultItems
	]);
	return {
		path,
		rows,
		onField: useCallback((index, field, value) => mutate((current) => current.map((r, i) => i === index ? {
			...r,
			[field]: value
		} : r)), [mutate]),
		onRemove: useCallback((index) => mutate((current) => removeRow(current, index)), [mutate]),
		onMove: useCallback((index, delta) => mutate((current) => moveRow(current, index, index + delta)), [mutate]),
		onDuplicate: useCallback((index) => mutate((current) => duplicateRow(current, index)), [mutate]),
		append: useCallback((row) => mutate((current) => [...current, withRowId(row)]), [mutate])
	};
}
//#endregion
export { useRowCollection };

//# sourceMappingURL=use-row-collection.js.map