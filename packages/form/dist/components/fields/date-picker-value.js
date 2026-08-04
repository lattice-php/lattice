import { DateFormatter, parseAbsolute, parseDate, parseDateTime, parseZonedDateTime, toTimeZone, toZoned } from "@internationalized/date";
//#region resources/js/components/fields/date-picker-value.ts
var dateTimeWithZone = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?)\s+(.+)$/;
var bareDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/;
var dateTimeFormatOptions = {
	day: "2-digit",
	hour: "2-digit",
	hourCycle: "h23",
	minute: "2-digit",
	month: "2-digit",
	year: "numeric"
};
var dateFormatOptions = {
	day: "2-digit",
	month: "2-digit",
	year: "numeric"
};
function parseDateValue(value) {
	if (typeof value !== "string" || value === "") return;
	try {
		return parseDate(value.slice(0, 10));
	} catch {
		return;
	}
}
function parseDateTimeValue(value, timezone) {
	if (typeof value !== "string" || value === "") return;
	const zoned = dateTimeWithZone.exec(value);
	try {
		if (zoned) return parseZonedDateTime(`${normalizeSeconds(zoned[1])}[${zoned[2]}]`);
		if (bareDateTime.test(value)) return toZoned(parseDateTime(normalizeSeconds(value)), timezone);
		return parseAbsolute(value, timezone);
	} catch {
		return;
	}
}
function parseDateDisplayValue(value, locale) {
	return parseDateValue(value) ?? parseLocalizedDate(value, locale);
}
function parseDateTimeDisplayValue(value, locale, timezone) {
	return parseDateTimeValue(value, timezone) ?? parseLocalizedDateTime(value, locale, timezone);
}
function formatDateValue(value) {
	return value?.toString().slice(0, 10) ?? "";
}
function formatDateDisplayValue(value, locale) {
	if (!value) return "";
	return new DateFormatter(locale, {
		...dateFormatOptions,
		timeZone: "UTC"
	}).format(value.toDate("UTC"));
}
function formatDateTimeValue(value, timezone) {
	if (!value) return "";
	return `${normalizeSeconds(("timeZone" in value ? toTimeZone(value, timezone) : toZoned(value, timezone)).toString().replace(/\[.+\]$/, "")).slice(0, 19)} ${timezone}`;
}
function formatDateTimeDisplayValue(value, locale, timezone) {
	if (!value) return "";
	const zoned = "timeZone" in value ? toTimeZone(value, timezone) : toZoned(value, timezone);
	return new DateFormatter(locale, {
		...dateTimeFormatOptions,
		timeZone: timezone
	}).format(zoned.toDate());
}
function formatTimeInputValue(value, timezone) {
	if (!value) return "";
	const zoned = "timeZone" in value ? toTimeZone(value, timezone) : toZoned(value, timezone);
	return [
		String(zoned.hour).padStart(2, "0"),
		String(zoned.minute).padStart(2, "0"),
		String(zoned.second).padStart(2, "0")
	].join(":");
}
function normalizeSeconds(value) {
	return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? `${value}:00` : value;
}
function parseLocalizedDate(value, locale) {
	const parts = localizedParts(value, locale, "date");
	if (!parts) return;
	try {
		return parseDate(`${parts.year.padStart(4, "0")}-${parts.month.padStart(2, "0")}-${parts.day.padStart(2, "0")}`);
	} catch {
		return;
	}
}
function parseLocalizedDateTime(value, locale, timezone) {
	const parts = localizedParts(value, locale, "date-time");
	if (!parts || !parts.hour || !parts.minute) return;
	try {
		return toZoned(parseDateTime(`${parts.year.padStart(4, "0")}-${parts.month.padStart(2, "0")}-${parts.day.padStart(2, "0")}T${parts.hour.padStart(2, "0")}:${parts.minute.padStart(2, "0")}:00`), timezone);
	} catch {
		return;
	}
}
function localizedParts(value, locale, mode) {
	if (typeof value !== "string" || value.trim() === "") return;
	const formatter = new DateFormatter(locale, mode === "date" ? dateFormatOptions : dateTimeFormatOptions);
	const sample = new Date(Date.UTC(2006, 10, 22, 14, 30, 0));
	const pattern = formatter.formatToParts(sample).map((part) => {
		if ([
			"day",
			"hour",
			"minute",
			"month",
			"year"
		].includes(part.type)) return `(?<${part.type}>\\d{1,4})`;
		return escapeRegExp(part.value).replace(/\s+/g, "\\s*");
	}).join("");
	const groups = new RegExp(`^\\s*${pattern}\\s*$`).exec(value)?.groups;
	if (!groups?.day || !groups.month || !groups.year) return;
	return {
		day: groups.day,
		hour: groups.hour,
		minute: groups.minute,
		month: groups.month,
		year: groups.year
	};
}
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
//#endregion
export { formatDateDisplayValue, formatDateTimeDisplayValue, formatDateTimeValue, formatDateValue, formatTimeInputValue, parseDateDisplayValue, parseDateTimeDisplayValue, parseDateTimeValue, parseDateValue };

//# sourceMappingURL=date-picker-value.js.map