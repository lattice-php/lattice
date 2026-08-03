import { jsx } from "react/jsx-runtime";
import { useFieldScope } from "@lattice-php/form/hooks/field-scope";
//#region resources/js/components/fields/hidden-input.tsx
var HiddenInputComponent = ({ node }) => {
	const scope = useFieldScope();
	const name = node.props.name;
	const value = scope ? scope.getValue(name) : node.props.value;
	return /* @__PURE__ */ jsx("input", {
		defaultValue: typeof value === "string" ? value : "",
		name: scope ? scope.scopedName(name) : name,
		type: "hidden"
	});
};
//#endregion
export { HiddenInputComponent };

//# sourceMappingURL=hidden-input.js.map