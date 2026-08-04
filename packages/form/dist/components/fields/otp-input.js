import { SimpleField } from "./simple-field.js";
import { jsx } from "react/jsx-runtime";
import { InputOTP } from "@lattice-php/ui/input-otp";
//#region resources/js/components/fields/otp-input.tsx
var OtpInputComponent = ({ node }) => {
	const props = node.props;
	return /* @__PURE__ */ jsx(SimpleField, {
		node,
		label: props.label ?? "",
		children: ({ name, testId, value, readOnly, disabled, commit }, controlProps) => /* @__PURE__ */ jsx(InputOTP, {
			...controlProps,
			autoFocus: props.autoFocus ?? false,
			"data-test": testId,
			disabled: disabled || readOnly,
			length: props.length,
			name,
			onChange: (next) => commit(next),
			value
		})
	});
};
//#endregion
export { OtpInputComponent };

//# sourceMappingURL=otp-input.js.map