import { Button } from "@lattice-php/ui/button";
import { Spinner } from "@lattice-php/ui/spinner";
import { jsx, jsxs } from "react/jsx-runtime";
import { useFormContext } from "@lattice-php/form/hooks/context";
//#region resources/js/components/base/submit-button.tsx
function FormSubmitButton({ label, summaryLabel, variant, emphasis }) {
	const { componentId, errors, fieldLabels, processing } = useFormContext();
	const invalidFields = Object.entries(errors).filter(([, message]) => Boolean(message)).map(([name, message]) => ({
		label: fieldLabels[name] ?? name,
		message
	}));
	const hasErrors = invalidFields.length > 0;
	return /* @__PURE__ */ jsxs("span", {
		className: "group relative inline-flex flex-col",
		children: [/* @__PURE__ */ jsxs(Button, {
			"data-lattice-form": componentId,
			"data-test": "form-submit",
			disabled: processing || hasErrors,
			emphasis,
			type: "submit",
			variant,
			children: [processing && /* @__PURE__ */ jsx(Spinner, {}), label]
		}), hasErrors && /* @__PURE__ */ jsxs("div", {
			className: "pointer-events-none absolute bottom-full left-1/2 z-lt-popover mb-2 w-max max-w-xs -translate-x-1/2 rounded-lt border border-lt-border bg-lt-surface p-3 text-left text-sm opacity-0 shadow-lt-md transition-opacity group-hover:opacity-100",
			role: "tooltip",
			children: [/* @__PURE__ */ jsx("p", {
				className: "mb-1 font-medium text-lt-fg",
				children: summaryLabel
			}), /* @__PURE__ */ jsx("ul", {
				className: "space-y-1",
				children: invalidFields.map((field) => /* @__PURE__ */ jsxs("li", {
					className: "text-lt-muted-fg",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "font-medium text-lt-fg",
							children: field.label
						}),
						" — ",
						field.message
					]
				}, field.label))
			})]
		})]
	});
}
//#endregion
export { FormSubmitButton };

//# sourceMappingURL=submit-button.js.map