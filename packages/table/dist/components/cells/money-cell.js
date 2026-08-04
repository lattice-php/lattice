import { NumericCell } from "./numeric-cell.js";
import { jsx } from "react/jsx-runtime";
//#region resources/js/components/cells/money-cell.tsx
var MoneyCell = ({ column, props, row, value }) => {
	const rawCode = props.currencyField ? row[props.currencyField] : void 0;
	const code = props.currency ?? (typeof rawCode === "string" ? rawCode : null);
	return /* @__PURE__ */ jsx(NumericCell, {
		column,
		copyable: props.copyable,
		value,
		format: {
			kind: "number",
			notation: "standard",
			minimumFractionDigits: props.minimumFractionDigits,
			maximumFractionDigits: props.maximumFractionDigits,
			currency: code,
			unit: null
		}
	});
};
//#endregion
export { MoneyCell };

//# sourceMappingURL=money-cell.js.map