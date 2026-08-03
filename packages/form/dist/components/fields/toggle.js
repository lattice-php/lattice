import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { FormFieldFrame } from "@lattice-php/form/components/base/field";
import { useFormContext } from "@lattice-php/form/hooks/context";
import { useDependentField } from "@lattice-php/form/hooks/use-dependent-field";
import { useFieldScope } from "@lattice-php/form/hooks/field-scope";
import { useFormValue } from "@lattice-php/form/hooks/values";
import { testIdentity } from "@lattice-php/core/test-id";
import { toBoolean } from "@lattice-php/form/lib/conditions";
import { fieldDomName } from "@lattice-php/form/lib/field-dom-name";
import { useFieldCommit } from "@lattice-php/form/hooks/use-field-commit";
import { useSeedDefault } from "@lattice-php/form/hooks/use-seed-default";
import { cn } from "@lattice-php/ui/lib/utils";
//#region resources/js/components/fields/toggle.tsx
var ToggleComponent = ({ node }) => {
	const { hidden, required, readOnly, disabled } = useDependentField(node);
	const props = node.props;
	const localName = props.name;
	const scope = useFieldScope();
	const { errors, fieldIdPrefix } = useFormContext();
	const name = fieldDomName(scope ? scope.scopedName(localName) : localName, fieldIdPrefix);
	const errorKey = scope ? scope.errorKey(localName) : localName;
	const globalValue = useFormValue(localName);
	const storedValue = scope ? scope.getValue(localName) : globalValue;
	const defaultChecked = toBoolean(props.value);
	const checked = storedValue !== void 0 ? toBoolean(storedValue) : defaultChecked;
	const locked = readOnly || disabled;
	const { commit } = useFieldCommit();
	useSeedDefault(localName, defaultChecked);
	if (hidden) return null;
	return /* @__PURE__ */ jsx(FormFieldFrame, {
		error: errors[errorKey],
		helperText: props.helperText ?? void 0,
		tooltip: props.tooltip ?? void 0,
		label: props.label ?? "",
		id: name,
		required,
		children: (controlProps) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("input", {
			disabled: locked,
			name,
			type: "hidden",
			value: checked ? "1" : "0"
		}), /* @__PURE__ */ jsx("button", {
			...controlProps,
			"aria-checked": checked,
			"aria-label": props.label ?? localName,
			autoFocus: props.autoFocus ?? false,
			className: cn("inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-lt-muted p-0.5 shadow-lt-xs transition-colors outline-none focus-visible:border-lt-ring focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-lt-ring/50 disabled:cursor-not-allowed disabled:bg-lt-disabled data-[state=checked]:bg-lt-primary disabled:data-[state=checked]:bg-lt-disabled"),
			"data-state": checked ? "checked" : "unchecked",
			"data-test": testIdentity(localName),
			disabled: locked,
			name,
			onClick: () => commit(localName, !checked),
			role: "switch",
			tabIndex: props.tabIndex ?? void 0,
			type: "button",
			children: /* @__PURE__ */ jsx("span", {
				className: "size-5 rounded-full bg-lt-bg shadow-lt-sm transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
				"data-state": checked ? "checked" : "unchecked"
			})
		})] })
	});
};
//#endregion
export { ToggleComponent };

//# sourceMappingURL=toggle.js.map