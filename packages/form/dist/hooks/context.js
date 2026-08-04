import { createContext, useContext } from "react";
import { jsx } from "react/jsx-runtime";
//#region resources/js/hooks/context.tsx
var FormContext = createContext({
	action: "#",
	clearErrors: () => {},
	componentId: void 0,
	componentRef: "",
	errors: {},
	fieldIdPrefix: void 0,
	fieldLabels: {},
	precognitive: false,
	processing: false,
	touch: () => {},
	validate: () => {},
	validateFields: () => {},
	validating: false
});
function FormProvider({ children, value }) {
	return /* @__PURE__ */ jsx(FormContext.Provider, {
		value,
		children
	});
}
function useFormContext() {
	return useContext(FormContext);
}
//#endregion
export { FormProvider, useFormContext };

//# sourceMappingURL=context.js.map