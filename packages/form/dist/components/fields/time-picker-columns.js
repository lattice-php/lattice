//#region resources/js/components/fields/time-picker-columns.ts
var timePattern = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
function parseTimeString(value) {
	if (typeof value !== "string") return null;
	const match = timePattern.exec(value.trim());
	if (!match) return null;
	const hour = Number(match[1]);
	const minute = Number(match[2]);
	const second = match[3] ? Number(match[3]) : 0;
	if (hour > 23 || minute > 59 || second > 59) return null;
	return {
		hour,
		minute,
		second
	};
}
function formatTimeValue(value, withSeconds) {
	const parts = [pad(value.hour), pad(value.minute)];
	if (withSeconds) parts.push(pad(value.second));
	return parts.join(":");
}
function secondsEnabled(step) {
	return step != null && step < 60;
}
function buildTimeColumns(step, options = {}) {
	const { min, max, current } = options;
	const minBound = toBound(min);
	const maxBound = toBound(max);
	const minuteStep = step == null || step < 60 ? 1 : step % 60 === 0 ? step / 60 : 1;
	return {
		hours: range(0, 23, 1).map((value) => ({
			value,
			label: pad(value),
			disabled: minBound != null && value < minBound.hour || maxBound != null && value > maxBound.hour
		})),
		minutes: withValue(range(0, 59, minuteStep), current?.minute).map((value) => ({
			value,
			label: pad(value),
			disabled: minuteDisabled(value, current, minBound, maxBound)
		})),
		seconds: secondsEnabled(step) ? range(0, 59, 1).map((value) => ({
			value,
			label: pad(value),
			disabled: false
		})) : null
	};
}
function minuteDisabled(minute, current, minBound, maxBound) {
	if (!current) return false;
	if (minBound != null && current.hour === minBound.hour && minute < minBound.minute) return true;
	if (maxBound != null && current.hour === maxBound.hour && minute > maxBound.minute) return true;
	return false;
}
function toBound(value) {
	const parsed = parseTimeString(value);
	return parsed ? {
		hour: parsed.hour,
		minute: parsed.minute
	} : null;
}
function withValue(values, extra) {
	if (extra == null || values.includes(extra)) return values;
	return [...values, extra].sort((left, right) => left - right);
}
function range(start, end, step) {
	const values = [];
	for (let value = start; value <= end; value += step) values.push(value);
	return values;
}
function pad(value) {
	return String(value).padStart(2, "0");
}
//#endregion
export { buildTimeColumns, formatTimeValue, parseTimeString, secondsEnabled };

//# sourceMappingURL=time-picker-columns.js.map