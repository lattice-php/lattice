import { toDate } from "../format/date-time.js";
import { currentTimezone } from "./timezone.js";
//#region resources/js/i18n/date-time-formatter.ts
/**
* i18next's built-in `datetime` formatter throws on a string, and
* `Translatable::with()` sends dates over the wire as ISO 8601 strings, so
* coercion to `Date` is required first.
*
* Replaces i18next's built-in `datetime` formatter on the shared instance,
* for every consumer of it — not just Lattice's own translations.
*
* Pins the formatter to Lattice's own {@link currentTimezone}, the same
* source `<DateTime>` renders through, so both agree on calendar day.
*/
function registerDateTimeFormatter(instance) {
	instance.services.formatter?.add("datetime", (value, lng, options) => {
		const date = toDate(value);
		if (!date) return String(value ?? "");
		return new Intl.DateTimeFormat(lng, {
			timeZone: currentTimezone(),
			...options
		}).format(date);
	});
}
//#endregion
export { registerDateTimeFormatter };

//# sourceMappingURL=date-time-formatter.js.map