import { jsx, jsxs } from "react/jsx-runtime";
import { FormFieldFrame } from "@lattice-php/form/components/base/field";
import { useFormContext } from "@lattice-php/form/hooks/context";
import { useFieldScope } from "@lattice-php/form/hooks/field-scope";
import { testIdentity } from "@lattice-php/core/test-id";
import { useFieldCommit } from "@lattice-php/form/hooks/use-field-commit";
import { useControlledField } from "@lattice-php/form/hooks/use-controlled-field";
import { AffixGroup } from "@lattice-php/ui/affix-group";
import PasswordInput from "@lattice-php/ui/password-input";
//#region resources/js/components/fields/password-input.tsx
var PasswordInputComponent = ({ node }) => {
	const props = node.props;
	const { errors } = useFormContext();
	const field = useControlledField(node);
	const { commit } = useFieldCommit();
	const scope = useFieldScope();
	const confirmation = props.confirmation;
	const confirmationLocalName = confirmation?.name ?? `${field.localName}_confirmation`;
	const confirmationName = scope ? scope.scopedName(confirmationLocalName) : confirmationLocalName;
	const confirmationErrorKey = scope ? scope.errorKey(confirmationLocalName) : confirmationLocalName;
	const passwordRules = (props.passwordRules ?? "") || void 0;
	if (field.hidden) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "grid gap-6",
		children: [/* @__PURE__ */ jsx(FormFieldFrame, {
			error: field.error,
			helperText: props.helperText ?? void 0,
			tooltip: props.tooltip ?? void 0,
			label: props.label ?? "",
			labelAction: props.labelAction ?? void 0,
			id: field.name,
			required: field.required,
			children: (controlProps) => /* @__PURE__ */ jsx(AffixGroup, {
				prefix: props.prefix,
				suffix: props.suffix,
				children: (controlClassName) => /* @__PURE__ */ jsx(PasswordInput, {
					...controlProps,
					autoComplete: props.autoComplete ?? "",
					autoFocus: props.autoFocus ?? false,
					className: controlClassName,
					"data-test": field.testId,
					disabled: field.disabled,
					name: field.name,
					onChange: (event) => {
						field.commit(event.target.value);
					},
					placeholder: props.placeholder ?? "",
					passwordrules: passwordRules,
					readOnly: field.readOnly,
					tabIndex: props.tabIndex ?? void 0,
					value: field.value
				})
			})
		}), confirmation && /* @__PURE__ */ jsx(FormFieldFrame, {
			error: errors[confirmationErrorKey],
			label: confirmation.label ?? "Confirm password",
			id: confirmationName,
			required: field.required,
			children: (controlProps) => /* @__PURE__ */ jsx(PasswordInput, {
				...controlProps,
				autoComplete: "new-password",
				"data-test": testIdentity(confirmationLocalName),
				disabled: field.disabled,
				name: confirmationName,
				onChange: (event) => {
					commit(confirmationLocalName, event.target.value);
				},
				placeholder: confirmation.placeholder ?? confirmation.label ?? "Confirm password",
				passwordrules: passwordRules,
				readOnly: field.readOnly,
				tabIndex: props.tabIndex ?? void 0
			})
		})]
	});
};
//#endregion
export { PasswordInputComponent };

//# sourceMappingURL=password-input.js.map