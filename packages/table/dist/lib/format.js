import { formatDateValue } from "@lattice-php/ui/format/date-time";
//#region resources/js/lib/format.ts
function formatCell(value, column, options) {
	if (value === null || value === void 0) return "";
	const date = (column?.props)?.date;
	if (date) return formatDateValue(value, date, options);
	if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
	return JSON.stringify(value);
}
function resolveLink(column, row, value) {
	const link = column.props.link;
	if (!link) return null;
	const href = link.href ?? String(value ?? "");
	if (href === "") return null;
	return href.replace(/\{([^}]+)\}/g, (_, key) => {
		if (key === "value") return encodeURIComponent(String(value ?? ""));
		return encodeURIComponent(String(row[key] ?? ""));
	});
}
//#endregion
export { formatCell, resolveLink };

//# sourceMappingURL=format.js.map