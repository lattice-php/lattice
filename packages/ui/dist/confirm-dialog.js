import { Button } from "./button.js";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog.js";
import { Spinner } from "./spinner.js";
import { jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/confirm-dialog.tsx
function ConfirmDialog({ title, description, confirmLabel, cancelLabel = "Cancel", confirmVariant = null, confirmEmphasis = null, processing = false, confirmDisabled = false, onConfirm, onCancel }) {
	const blockWhileProcessing = (event) => {
		if (processing) event.preventDefault();
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open: true,
		onOpenChange: (open) => {
			if (!open) onCancel();
		},
		children: /* @__PURE__ */ jsxs(DialogContent, {
			...description ? {} : { "aria-describedby": void 0 },
			width: "md",
			onEscapeKeyDown: blockWhileProcessing,
			onInteractOutside: blockWhileProcessing,
			children: [/* @__PURE__ */ jsxs("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ jsx(DialogTitle, { children: title }), description && /* @__PURE__ */ jsx(DialogDescription, { children: description })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-6 flex justify-end gap-2",
				children: [/* @__PURE__ */ jsx(Button, {
					type: "button",
					emphasis: "outline",
					"data-test": "confirm-cancel",
					disabled: processing,
					onClick: onCancel,
					children: cancelLabel
				}), /* @__PURE__ */ jsxs(Button, {
					type: "button",
					emphasis: confirmEmphasis,
					variant: confirmVariant,
					"data-test": "confirm-accept",
					disabled: processing || confirmDisabled,
					onClick: onConfirm,
					children: [processing && /* @__PURE__ */ jsx(Spinner, {}), confirmLabel]
				})]
			})]
		})
	});
}
//#endregion
export { ConfirmDialog };

//# sourceMappingURL=confirm-dialog.js.map