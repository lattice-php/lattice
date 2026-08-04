import { useTimezone } from "../i18n/timezone.js";
import { locale_exports } from "../i18n/locale.js";
import { useMemo } from "react";
//#region resources/js/format/format-context.ts
function useFormatContext() {
	const { locale } = (0, locale_exports.useLocale)();
	const { timezone } = useTimezone();
	return useMemo(() => ({
		locale,
		timezone
	}), [locale, timezone]);
}
//#endregion
export { useFormatContext };

//# sourceMappingURL=format-context.js.map