import { formatDateValue, preciseDateTime, toDate } from "../format/date-time.js";
import { useTimezone } from "./timezone.js";
import { useLocale } from "./locale.js";
import { jsx } from "react/jsx-runtime";
//#region resources/js/i18n/date-time.tsx
function DateTime({ value, dateStyle = "medium", timeStyle = "short" }) {
	const { locale } = useLocale();
	const { timezone } = useTimezone();
	if (value === null || value === void 0 || value === "") return null;
	const options = {
		locale,
		timeZone: timezone
	};
	const text = formatDateValue(value, {
		dateStyle,
		timeStyle
	}, options);
	const iso = isoOrNull(value);
	const title = preciseDateTime(value, options);
	return /* @__PURE__ */ jsx("time", {
		dateTime: iso ?? void 0,
		title: title || void 0,
		children: text
	});
}
function isoOrNull(value) {
	return toDate(value)?.toISOString() ?? null;
}
//#endregion
export { DateTime };

//# sourceMappingURL=date-time.js.map