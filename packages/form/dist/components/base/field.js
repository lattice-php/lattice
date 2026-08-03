import { jsx, jsxs } from "react/jsx-runtime";
import { useInTableCell } from "@lattice-php/form/hooks/row-layout-context";
import { Label } from "@lattice-php/ui/label";
import { cn } from "@lattice-php/ui/lib/utils";
import InputError from "@lattice-php/ui/input-error";
import { InfoTooltip } from "@lattice-php/ui/info-tooltip";
import { TextLink } from "@lattice-php/ui/text-link";
//#region resources/js/components/base/field.tsx
function FormFieldFrame({ children, className, error, helperText, id, label, labelAction, required, tooltip, ...props }) {
	const bare = useInTableCell();
	const labelId = `${id}-label`;
	const helperTextId = !bare && helperText ? `${id}-helper` : void 0;
	const errorId = error ? `${id}-error` : void 0;
	const control = children({
		id,
		"aria-describedby": [helperTextId, errorId].filter(Boolean).join(" ") || void 0,
		"aria-invalid": error ? true : void 0,
		"aria-labelledby": label ? labelId : void 0,
		"aria-required": required || void 0
	});
	if (bare) return /* @__PURE__ */ jsxs("div", {
		...props,
		className: cn("grid gap-1", className),
		children: [
			/* @__PURE__ */ jsx(Label, {
				id: labelId,
				htmlFor: id,
				className: "sr-only",
				children: label
			}),
			control,
			/* @__PURE__ */ jsx(InputError, {
				id: errorId,
				message: error
			})
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		...props,
		className: cn("grid gap-2", className),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex min-h-5 items-center",
				children: [
					/* @__PURE__ */ jsx(Label, {
						id: labelId,
						htmlFor: id,
						children: label
					}),
					required && /* @__PURE__ */ jsx("span", {
						"aria-hidden": "true",
						className: "ml-0.5 text-lt-danger",
						children: "*"
					}),
					/* @__PURE__ */ jsx(InfoTooltip, { content: tooltip }),
					labelAction && /* @__PURE__ */ jsx(TextLink, {
						href: labelAction.href,
						tabIndex: labelAction.tabIndex ?? void 0,
						className: "ml-auto text-sm",
						children: labelAction.label
					})
				]
			}),
			control,
			helperText && /* @__PURE__ */ jsx("p", {
				id: helperTextId,
				className: "text-sm text-lt-muted-fg",
				children: helperText
			}),
			/* @__PURE__ */ jsx(InputError, {
				id: errorId,
				message: error
			})
		]
	});
}
//#endregion
export { FormFieldFrame };

//# sourceMappingURL=field.js.map