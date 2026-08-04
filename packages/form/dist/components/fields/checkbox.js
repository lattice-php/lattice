import { jsx, jsxs } from "react/jsx-runtime";
import { useFormContext } from "@lattice-php/form/hooks/context";
import { useDependentField } from "@lattice-php/form/hooks/use-dependent-field";
import { useFieldScope } from "@lattice-php/form/hooks/field-scope";
import { useFormValue } from "@lattice-php/form/hooks/values";
import { testIdentity } from "@lattice-php/core/test-id";
import { Checkbox } from "@lattice-php/ui/checkbox";
import { Label } from "@lattice-php/ui/label";
import { toBoolean } from "@lattice-php/form/lib/conditions";
import { fieldDomName } from "@lattice-php/form/lib/field-dom-name";
import { useFieldCommit } from "@lattice-php/form/hooks/use-field-commit";
import { useSeedDefault } from "@lattice-php/form/hooks/use-seed-default";
//#region resources/js/components/fields/checkbox.tsx
var CheckboxComponent = ({ node }) => {
	const { hidden, readOnly, disabled } = useDependentField(node);
	const localName = node.props.name;
	const scope = useFieldScope();
	const { fieldIdPrefix } = useFormContext();
	const name = fieldDomName(scope ? scope.scopedName(localName) : localName, fieldIdPrefix);
	const globalValue = useFormValue(localName);
	const storedValue = scope ? scope.getValue(localName) : globalValue;
	const { commit } = useFieldCommit();
	const defaultChecked = toBoolean(node.props.value);
	const checked = storedValue !== void 0 ? toBoolean(storedValue) : defaultChecked;
	useSeedDefault(localName, defaultChecked);
	if (hidden) return null;
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
		className: "flex items-center space-x-3",
		children: [/* @__PURE__ */ jsx(Checkbox, {
			autoFocus: node.props.autoFocus ?? void 0,
			checked,
			"data-test": testIdentity(localName),
			disabled: readOnly || disabled,
			id: name,
			name,
			onCheckedChange: (next) => {
				commit(localName, next === true);
			},
			tabIndex: node.props.tabIndex ?? void 0
		}), /* @__PURE__ */ jsx(Label, {
			htmlFor: name,
			children: node.props.label
		})]
	}), node.props.helperText && /* @__PURE__ */ jsx("p", {
		className: "mt-1 pl-7 text-sm text-lt-muted-fg",
		children: node.props.helperText
	})] });
};
//#endregion
export { CheckboxComponent };

//# sourceMappingURL=checkbox.js.map