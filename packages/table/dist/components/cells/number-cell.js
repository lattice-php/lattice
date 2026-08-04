import { NumericCell } from "./numeric-cell.js";
import { jsx } from "react/jsx-runtime";
//#region resources/js/components/cells/number-cell.tsx
var NumberCell = ({ column, props, value }) => /* @__PURE__ */ jsx(NumericCell, {
	column,
	copyable: props.copyable,
	value,
	format: {
		kind: "number",
		notation: props.compact ? "compact" : "standard",
		minimumFractionDigits: props.minimumFractionDigits,
		maximumFractionDigits: props.maximumFractionDigits,
		currency: null,
		unit: props.unit
	}
});
//#endregion
export { NumberCell };

//# sourceMappingURL=number-cell.js.map