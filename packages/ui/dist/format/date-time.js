//#region resources/js/format/date-time.ts
function formatDateValue(value, date, options) {
	const parsed = toDate(value);
	if (!parsed) return String(value ?? "");
	const intl = { timeZone: options?.timeZone };
	if (date.dateStyle) intl.dateStyle = date.dateStyle;
	if (date.timeStyle) intl.timeStyle = date.timeStyle;
	if (date.month) intl.month = date.month;
	if (date.year) intl.year = date.year;
	return new Intl.DateTimeFormat(options?.locale, intl).format(parsed);
}
function toDate(value) {
	const date = value instanceof Date ? value : typeof value === "string" || typeof value === "number" ? new Date(value) : null;
	return date && !Number.isNaN(date.getTime()) ? date : null;
}
function preciseDateTime(value, options) {
	const date = toDate(value);
	if (!date) return "";
	const formatted = new Intl.DateTimeFormat(options?.locale, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		timeZone: options?.timeZone,
		timeZoneName: "short"
	}).format(date);
	return options?.timeZone ? `${formatted} (${options.timeZone})` : formatted;
}
//#endregion
export { formatDateValue, preciseDateTime, toDate };

//# sourceMappingURL=date-time.js.map