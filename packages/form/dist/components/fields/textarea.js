import { SimpleField } from "./simple-field.js";
import { jsx } from "react/jsx-runtime";
import { Textarea } from "@lattice-php/ui/textarea";
//#region resources/js/components/fields/textarea.tsx
var TextareaComponent = ({ node }) => {
	const props = node.props;
	return /* @__PURE__ */ jsx(SimpleField, {
		node,
		label: props.label ?? "",
		children: ({ name, testId, value, readOnly, disabled, commit }, controlProps) => /* @__PURE__ */ jsx(Textarea, {
			...controlProps,
			autoFocus: props.autoFocus ?? false,
			"data-test": testId,
			disabled,
			name,
			onChange: (event) => commit(event.target.value),
			placeholder: props.placeholder ?? "",
			readOnly,
			rows: props.rows ?? void 0,
			tabIndex: props.tabIndex ?? void 0,
			value
		})
	});
};
//#endregion
export { TextareaComponent };

//# sourceMappingURL=textarea.js.map