import { useFieldScope } from "./field-scope.js";
import { useFormValue, useSetFormValue } from "./values.js";
import { useEffect } from "react";
//#region resources/js/hooks/use-seed-default.ts
/**
* Seed a field's default into the store so dependent fields and the submitted
* payload reflect it before the user interacts. Pass undefined to skip.
*/
function useSeedDefault(name, value) {
	const scope = useFieldScope();
	const globalStored = useFormValue(name);
	const stored = scope ? scope.getValue(name) : globalStored;
	const setValue = useSetFormValue();
	useEffect(() => {
		if (stored === void 0 && value !== void 0) if (scope) scope.setValue(name, value);
		else setValue(name, value);
	}, [
		name,
		value,
		stored,
		setValue,
		scope
	]);
}
//#endregion
export { useSeedDefault };

//# sourceMappingURL=use-seed-default.js.map