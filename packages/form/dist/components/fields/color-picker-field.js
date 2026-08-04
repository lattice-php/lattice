import { SimpleField } from "./simple-field.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { cn } from "@lattice-php/ui/lib/utils";
import { ColorPicker, normalizeHex } from "@lattice-php/ui/color-picker";
import { controlSurface } from "@lattice-php/ui/control";
import { Popover, PopoverContent, PopoverTrigger } from "@lattice-php/ui/popover";
//#region resources/js/components/fields/color-picker-field.tsx
var ColorPickerFieldComponent = ({ node }) => {
	const props = node.props;
	return /* @__PURE__ */ jsx(SimpleField, {
		node,
		label: props.label ?? "",
		children: ({ name, value, readOnly, disabled, commit }, controlProps) => {
			const hex = normalizeHex(value);
			return /* @__PURE__ */ jsxs(Popover, { children: [
				/* @__PURE__ */ jsx("input", {
					name,
					type: "hidden",
					value: hex ?? ""
				}),
				/* @__PURE__ */ jsx(PopoverTrigger, {
					asChild: true,
					children: /* @__PURE__ */ jsx("button", {
						...controlProps,
						className: cn(controlSurface(), "flex items-center gap-2 text-left"),
						"data-test": `color-picker-${name}`,
						disabled: disabled || readOnly,
						type: "button",
						children: hex ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
							"aria-hidden": "true",
							className: "size-4 shrink-0 rounded-full border border-lt-border",
							style: { background: hex }
						}), /* @__PURE__ */ jsx("span", {
							className: "tabular-nums",
							children: hex
						})] }) : /* @__PURE__ */ jsx("span", {
							className: "text-lt-muted-fg",
							children: props.placeholder ?? ""
						})
					})
				}),
				/* @__PURE__ */ jsx(PopoverContent, {
					className: "p-3",
					children: /* @__PURE__ */ jsx(ColorPicker, {
						onChange: (next) => commit(next),
						palette: props.palette,
						value: hex ?? "#6b7280"
					})
				})
			] });
		}
	});
};
//#endregion
export { ColorPickerFieldComponent };

//# sourceMappingURL=color-picker-field.js.map