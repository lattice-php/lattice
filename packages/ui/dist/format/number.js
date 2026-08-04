import { numericValue } from "./numeric.js";
//#region resources/js/format/number.ts
function formatNumber(value, format, locale) {
	const number = numericValue(value);
	if (number === null) return String(value ?? "");
	const options = {
		notation: format.notation,
		minimumFractionDigits: format.minimumFractionDigits ?? void 0,
		maximumFractionDigits: format.maximumFractionDigits ?? void 0
	};
	if (format.currency) {
		options.style = "currency";
		options.currency = format.currency;
	} else if (format.unit) {
		options.style = "unit";
		options.unit = format.unit;
	}
	return new Intl.NumberFormat(locale, options).format(number);
}
//#endregion
export { formatNumber };

//# sourceMappingURL=number.js.map