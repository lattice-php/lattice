import { jsx } from "react/jsx-runtime";
import { fieldProps } from "@lattice-php/form/lib/field-props";
import { FormFieldFrame } from "@lattice-php/form/components/base/field";
import { useControlledField } from "@lattice-php/form/hooks/use-controlled-field";
//#region resources/js/components/fields/simple-field.tsx
function SimpleField({ node, label, children }) {
	const field = useControlledField(node);
	if (field.hidden) return null;
	return /* @__PURE__ */ jsx(FormFieldFrame, {
		error: field.error,
		helperText: fieldProps(node).helperText ?? void 0,
		tooltip: fieldProps(node).tooltip ?? void 0,
		label,
		id: field.name,
		required: field.required,
		children: (controlProps) => children(field, controlProps)
	});
}
//#endregion
export { SimpleField };

//# sourceMappingURL=simple-field.js.map