import { SimpleField } from "./simple-field.js";
import { formatTimeValue, parseTimeString, secondsEnabled } from "./time-picker-columns.js";
import { TimePicker } from "./time-picker.js";
import { Button } from "@lattice-php/ui/button";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@lattice-php/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@lattice-php/ui/popover";
import { Input } from "@lattice-php/ui/input";
//#region resources/js/components/fields/time-input.tsx
var TimeInputComponent = ({ node }) => {
	const props = node.props;
	const withSeconds = secondsEnabled(props.step);
	const triggerLabel = props.label ?? props.name;
	return /* @__PURE__ */ jsx(SimpleField, {
		node,
		label: props.label ?? "",
		children: ({ name, testId, value, readOnly, disabled, commit, blur }, controlProps) => /* @__PURE__ */ jsxs("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ jsx(Input, {
				...controlProps,
				"aria-label": triggerLabel,
				autoFocus: props.autoFocus ?? false,
				"data-test": testId,
				disabled,
				name,
				onBlur: () => {
					const parsed = parseTimeString(value);
					if (parsed) commit(formatTimeValue(parsed, withSeconds));
					blur();
				},
				onChange: (event) => commit(event.target.value),
				readOnly,
				tabIndex: props.tabIndex ?? void 0,
				type: "text",
				value
			}), /* @__PURE__ */ jsxs(Popover, { children: [/* @__PURE__ */ jsx(PopoverTrigger, {
				asChild: true,
				children: /* @__PURE__ */ jsx(Button, {
					"aria-label": `Open ${triggerLabel} time picker`,
					disabled: disabled || readOnly,
					size: "icon",
					type: "button",
					variant: "secondary",
					children: /* @__PURE__ */ jsx(Icon, {
						name: "clock",
						className: "size-lt-icon-md",
						"aria-hidden": "true"
					})
				})
			}), /* @__PURE__ */ jsx(PopoverContent, {
				className: "p-2",
				children: /* @__PURE__ */ jsx(TimePicker, {
					value: parseTimeString(value),
					onChange: (next) => commit(formatTimeValue(next, withSeconds)),
					step: props.step,
					min: props.min,
					max: props.max,
					disabled,
					readOnly,
					testId: `${testId}-picker`
				})
			})] })]
		})
	});
};
//#endregion
export { TimeInputComponent };

//# sourceMappingURL=time-input.js.map