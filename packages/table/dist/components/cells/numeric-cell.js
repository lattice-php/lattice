import { CopyableCell } from "./copyable-cell.js";
import { useLocale } from "@lattice-php/ui/i18n";
import { jsx } from "react/jsx-runtime";
import { formatCell } from "@lattice-php/table/lib/format";
import { formatNumber } from "@lattice-php/ui/format/number";
import { numericValue } from "@lattice-php/ui/format/numeric";
//#region resources/js/components/cells/numeric-cell.tsx
/** Shared numeric cell body for the money and number columns. */
function NumericCell({ column, copyable, format, value }) {
	const { locale } = useLocale();
	if (numericValue(value) === null) return /* @__PURE__ */ jsx("span", { children: formatCell(value, column) });
	return /* @__PURE__ */ jsx(CopyableCell, {
		column,
		copyable,
		value: String(value),
		children: /* @__PURE__ */ jsx("span", {
			className: "tabular-nums",
			children: formatNumber(value, format, locale)
		})
	});
}
//#endregion
export { NumericCell };

//# sourceMappingURL=numeric-cell.js.map