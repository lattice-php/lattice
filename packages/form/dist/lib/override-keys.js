import { ROW_ID_KEY } from "@lattice-php/form/components/fields/repeater-rows";
//#region resources/js/lib/override-keys.ts
function rowIdFrom(row) {
	return typeof row[ROW_ID_KEY] === "string" ? row[ROW_ID_KEY] : null;
}
function buildOverrideKey(base, rowId, index, name) {
	return `${base}.${rowId ?? String(index)}.${name}`;
}
//#endregion
export { buildOverrideKey, rowIdFrom };

//# sourceMappingURL=override-keys.js.map