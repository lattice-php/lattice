import { useFormContext } from "./context.js";
import { useFieldScope } from "./field-scope.js";
import { useFormValue } from "./values.js";
import { useFieldCommit } from "./use-field-commit.js";
import { useDependentField } from "./use-dependent-field.js";
import { fieldProps } from "@lattice-php/form/lib/field-props";
import { testIdentity } from "@lattice-php/core/test-id";
import { fieldDomName } from "@lattice-php/form/lib/field-dom-name";
//#region resources/js/hooks/use-controlled-field.ts
function useControlledField(node) {
	const { errors, fieldIdPrefix } = useFormContext();
	const scope = useFieldScope();
	const state = useDependentField(node);
	const props = fieldProps(node);
	const localName = props.name ?? "";
	const globalValue = useFormValue(localName);
	const storedValue = scope ? scope.getValue(localName) : globalValue;
	const currentValue = storedValue !== void 0 ? storedValue : props.value;
	const value = typeof currentValue === "string" || typeof currentValue === "number" ? String(currentValue) : "";
	const domName = fieldDomName(scope ? scope.scopedName(localName) : localName, fieldIdPrefix);
	const errorKey = scope ? scope.errorKey(localName) : localName;
	const { commit: commitField, change: changeField, blur: blurField } = useFieldCommit();
	const commit = (next) => commitField(localName, next);
	const change = (next) => changeField(localName, next);
	const blur = () => blurField(localName);
	return {
		...state,
		localName,
		name: domName,
		testId: testIdentity(localName),
		value,
		error: errors[errorKey],
		commit,
		change,
		blur
	};
}
//#endregion
export { useControlledField };

//# sourceMappingURL=use-controlled-field.js.map