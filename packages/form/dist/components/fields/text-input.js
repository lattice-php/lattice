import { SimpleField } from "./simple-field.js";
import { jsx } from "react/jsx-runtime";
import { AffixGroup } from "@lattice-php/ui/affix-group";
import { Input } from "@lattice-php/ui/input";
import { CopyButton } from "@lattice-php/ui/copyable-text";
//#region resources/js/components/fields/text-input.tsx
var TextInputComponent = ({ node }) => {
	const props = node.props;
	return /* @__PURE__ */ jsx(SimpleField, {
		node,
		label: props.label ?? "",
		children: ({ name, testId, value, readOnly, disabled, commit }, controlProps) => /* @__PURE__ */ jsx(AffixGroup, {
			prefix: props.prefix,
			suffix: props.suffix,
			end: props.copyable ? /* @__PURE__ */ jsx(CopyButton, {
				className: "h-lt-control-md gap-1.5 rounded-l-none rounded-r-lt-sm border-l-0 border-lt-input px-3 group-has-[:focus-visible]:border-lt-ring",
				label: props.label ?? name,
				testId: `${testId}-copy`,
				value
			}) : null,
			children: (controlClassName) => /* @__PURE__ */ jsx(Input, {
				...controlProps,
				autoComplete: props.autoComplete ?? "",
				autoFocus: props.autoFocus ?? false,
				className: controlClassName,
				"data-test": testId,
				disabled,
				name,
				onChange: (event) => commit(event.target.value),
				placeholder: props.placeholder ?? "",
				readOnly,
				tabIndex: props.tabIndex ?? void 0,
				type: props.type ?? "text",
				value
			})
		})
	});
};
//#endregion
export { TextInputComponent };

//# sourceMappingURL=text-input.js.map