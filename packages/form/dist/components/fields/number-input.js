import { SimpleField } from "./simple-field.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { AffixGroup } from "@lattice-php/ui/affix-group";
import { Input } from "@lattice-php/ui/input";
//#region resources/js/components/fields/number-input.tsx
var NumberInputComponent = ({ node }) => {
	const props = node.props;
	return /* @__PURE__ */ jsx(SimpleField, {
		node,
		label: props.label ?? "",
		children: ({ name, testId, value, readOnly, disabled, commit }, controlProps) => {
			const onChange = (event) => commit(event.target.value);
			return props.slider ? /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ jsx("input", {
					...controlProps,
					"aria-label": props.label ?? "",
					className: "h-2 w-full cursor-pointer appearance-none rounded-lt-sm bg-lt-muted accent-lt-primary disabled:cursor-not-allowed disabled:accent-lt-disabled",
					"data-test": testId,
					disabled: disabled || readOnly,
					max: props.max ?? void 0,
					min: props.min ?? void 0,
					name,
					onChange,
					step: props.step ?? void 0,
					tabIndex: props.tabIndex ?? void 0,
					type: "range",
					value
				}), /* @__PURE__ */ jsx("output", {
					className: "w-10 shrink-0 text-right text-sm tabular-nums text-lt-fg",
					children: value
				})]
			}) : /* @__PURE__ */ jsx(AffixGroup, {
				prefix: props.prefix,
				suffix: props.suffix,
				children: (controlClassName) => /* @__PURE__ */ jsx(Input, {
					...controlProps,
					autoFocus: props.autoFocus ?? false,
					className: controlClassName,
					"data-test": testId,
					disabled,
					max: props.max ?? void 0,
					min: props.min ?? void 0,
					name,
					onChange,
					placeholder: props.placeholder ?? "",
					readOnly,
					step: props.step ?? void 0,
					tabIndex: props.tabIndex ?? void 0,
					type: "number",
					value
				})
			});
		}
	});
};
//#endregion
export { NumberInputComponent };

//# sourceMappingURL=number-input.js.map