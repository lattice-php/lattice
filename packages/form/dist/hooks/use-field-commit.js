import { useFormContext } from "./context.js";
import { usePrefillController } from "./prefill-context.js";
import { useFieldScope } from "./field-scope.js";
import { useSetFormValue } from "./values.js";
import { createContext, createElement, useContext } from "react";
//#region resources/js/hooks/use-field-commit.ts
var FieldCommitOverrideContext = createContext(null);
function FieldCommitOverrideProvider({ children, value }) {
	return createElement(FieldCommitOverrideContext.Provider, { value }, children);
}
/**
* The shared field-mutation contract every form field uses to write its value
* and drive precognition. Fields that validate on change call `commit`; fields
* that validate on blur/close (rich editor, select) call `change` then `blur`.
*
* When called inside a `FieldScopeProvider`, writes go through the scope's
* `setValue` and error paths use the scoped dot-key; outside a scope the
* behavior is identical to before.
*/
function useFieldCommit() {
	const override = useContext(FieldCommitOverrideContext);
	const { clearErrors, precognitive, validate } = useFormContext();
	const setGlobal = useSetFormValue();
	const scope = useFieldScope();
	const prefill = usePrefillController();
	if (override) return override;
	const write = (name, value) => {
		if (scope) scope.setValue(name, value);
		else setGlobal(name, value);
		prefill?.markUserEdit(scope ? scope.overrideKey(name) : name);
	};
	const errorPath = (name) => scope ? scope.errorKey(name) : name;
	return {
		commit(name, value) {
			write(name, value);
			if (precognitive) validate(errorPath(name));
			else clearErrors(errorPath(name));
		},
		change(name, value) {
			write(name, value);
			clearErrors(errorPath(name));
		},
		blur(name) {
			if (precognitive) validate(errorPath(name));
		}
	};
}
//#endregion
export { FieldCommitOverrideProvider, useFieldCommit };

//# sourceMappingURL=use-field-commit.js.map