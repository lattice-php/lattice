import { useFieldScope } from "./field-scope.js";
import { useFormValuesFor } from "./values.js";
import { useMemo } from "react";
import { fieldProps } from "@lattice-php/form/lib/field-props";
import { conditionFields, evaluateConditions } from "@lattice-php/form/lib/conditions";
//#region resources/js/hooks/use-dependent-field.ts
function useDependentField(node) {
	const scope = useFieldScope();
	const props = fieldProps(node);
	const fields = useMemo(() => conditionFields(props.conditions), [props.conditions]);
	const values = useFormValuesFor(fields);
	const conditionValues = scope ? {
		...values,
		...scope.values
	} : values;
	return evaluateConditions(props.conditions ?? void 0, conditionValues, {
		required: props.required ?? false,
		readOnly: props.readOnly ?? false,
		disabled: props.disabled ?? false
	});
}
//#endregion
export { useDependentField };

//# sourceMappingURL=use-dependent-field.js.map