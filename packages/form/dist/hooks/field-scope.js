import { createContext, useContext, useMemo } from "react";
import { jsx } from "react/jsx-runtime";
import { appendPath, getPath, toHtmlName } from "@lattice-php/form/lib/form-path";
import { buildOverrideKey, rowIdFrom } from "@lattice-php/form/lib/override-keys";
//#region resources/js/hooks/field-scope.tsx
var FieldScopeContext = createContext(null);
function childCollectionIdentity(base, parent) {
	if (!parent) return base;
	const local = base.startsWith(`${parent.path}.`) ? base.slice(parent.path.length + 1) : base;
	return appendPath(parent.identityPath, local);
}
function FieldScopeProvider({ base, index, row, onChange, children }) {
	const parent = useContext(FieldScopeContext);
	const value = useMemo(() => {
		const scopedRow = row ?? {};
		const rowId = rowIdFrom(scopedRow);
		const path = appendPath(base, index);
		const identityCollection = childCollectionIdentity(base, parent);
		const identityPath = appendPath(identityCollection, rowId ?? index);
		return {
			row: scopedRow,
			rowId,
			path,
			values: parent ? {
				...parent.values,
				...scopedRow
			} : scopedRow,
			identityPath,
			getValue: (name) => getPath(scopedRow, name),
			setValue: onChange,
			scopedName: (name) => toHtmlName(appendPath(path, name)),
			errorKey: (name) => appendPath(path, name),
			overrideKey: (name) => buildOverrideKey(identityCollection, rowId, index, name)
		};
	}, [
		base,
		index,
		row,
		onChange,
		parent
	]);
	return /* @__PURE__ */ jsx(FieldScopeContext.Provider, {
		value,
		children
	});
}
/** Null outside a row so callers can preserve top-level behavior without a wrapper. */
function useFieldScope() {
	return useContext(FieldScopeContext);
}
//#endregion
export { FieldScopeProvider, useFieldScope };

//# sourceMappingURL=field-scope.js.map