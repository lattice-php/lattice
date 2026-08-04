import { SimpleField } from "./simple-field.js";
import { DatePicker } from "./date-picker.js";
import { jsx } from "react/jsx-runtime";
//#region resources/js/components/fields/date-input.tsx
var DateInputComponent = ({ node }) => {
	const props = node.props;
	return /* @__PURE__ */ jsx(SimpleField, {
		node,
		label: props.label ?? "",
		children: ({ name, testId, value, readOnly, disabled, change, blur }, controlProps) => /* @__PURE__ */ jsx(DatePicker, {
			controlProps,
			autoFocus: props.autoFocus ?? false,
			disabled,
			label: props.label ?? props.name,
			max: props.max || void 0,
			min: props.min || void 0,
			mode: "date",
			name,
			onBlur: blur,
			onChange: change,
			readOnly,
			tabIndex: props.tabIndex ?? void 0,
			testId: testId ?? props.name,
			value
		})
	});
};
//#endregion
export { DateInputComponent };

//# sourceMappingURL=date-input.js.map