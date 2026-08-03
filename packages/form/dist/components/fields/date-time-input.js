import { SimpleField } from "./simple-field.js";
import { DatePicker } from "./date-picker.js";
import { jsx } from "react/jsx-runtime";
import { useTimezone } from "@lattice-php/ui/i18n";
//#region resources/js/components/fields/date-time-input.tsx
var DateTimeInputComponent = ({ node }) => {
	const props = node.props;
	const { timezone } = useTimezone();
	return /* @__PURE__ */ jsx(SimpleField, {
		node,
		label: props.label ?? "",
		children: ({ name, testId, value, readOnly, disabled, change, blur }, controlProps) => /* @__PURE__ */ jsx(DatePicker, {
			controlProps,
			autoFocus: props.autoFocus ?? false,
			disabled,
			label: props.label ?? props.name,
			max: props.max,
			min: props.min,
			mode: "date-time",
			name,
			onBlur: blur,
			onChange: change,
			readOnly,
			step: props.step,
			tabIndex: props.tabIndex ?? void 0,
			testId: testId ?? props.name,
			timezone,
			value
		})
	});
};
//#endregion
export { DateTimeInputComponent };

//# sourceMappingURL=date-time-input.js.map