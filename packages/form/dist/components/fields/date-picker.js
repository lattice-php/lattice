import { Suspense, lazy } from "react";
import { jsx } from "react/jsx-runtime";
//#region resources/js/components/fields/date-picker.tsx
var DatePickerField = lazy(async () => {
	const { DatePickerField } = await import("./date-picker-field.js");
	return { default: DatePickerField };
});
function DatePicker(props) {
	return /* @__PURE__ */ jsx(Suspense, {
		fallback: null,
		children: /* @__PURE__ */ jsx(DatePickerField, { ...props })
	});
}
//#endregion
export { DatePicker };

//# sourceMappingURL=date-picker.js.map