//#region resources/js/components/fields/repeater-rows.ts
/**
* Reserved per-row identity key: server-filled rows arrive with a uuid, the
* client mints one for rows it creates, and it submits with the row so
* validated data identifies every row.
*/
var ROW_ID_KEY = "rowId";
function withRowId(row) {
	return row["rowId"] ? row : {
		...row,
		[ROW_ID_KEY]: crypto.randomUUID()
	};
}
/** Ensure every row has a stable id; returns the SAME array reference if none were missing. */
function ensureRowIds(rows) {
	if (rows.every((row) => Boolean(row["rowId"]))) return rows;
	return rows.map(withRowId);
}
function seedRows(value, defaultItems) {
	if (Array.isArray(value) && value.length > 0) return value.map((row) => row && typeof row === "object" ? { ...row } : {});
	return Array.from({ length: Math.max(0, defaultItems) }, () => ({}));
}
function addRow(rows) {
	return [...rows, {}];
}
function removeRow(rows, index) {
	return rows.filter((_, i) => i !== index);
}
function duplicateRow(rows, index) {
	const source = rows[index];
	if (!source) return rows;
	const { [ROW_ID_KEY]: _id, ...copy } = source;
	return [
		...rows.slice(0, index + 1),
		withRowId(copy),
		...rows.slice(index + 1)
	];
}
function moveRow(rows, from, to) {
	const next = [...rows];
	const [moved] = next.splice(from, 1);
	next.splice(to, 0, moved);
	return next;
}
//#endregion
export { ROW_ID_KEY, addRow, duplicateRow, ensureRowIds, moveRow, removeRow, seedRows, withRowId };

//# sourceMappingURL=repeater-rows.js.map