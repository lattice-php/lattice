import { cn } from "./lib/utils.js";
import { Icon } from "./icons/sprite.js";
import { Button } from "./button.js";
import "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import * as DialogPrimitive from "@radix-ui/react-dialog";
//#region resources/js/dialog.tsx
var dialogContentVariants = cva("fixed z-lt-modal w-full overflow-y-auto bg-lt-bg p-6 shadow-lt-lg", {
	variants: {
		placement: {
			center: "left-1/2 top-1/2 max-h-[min(680px,calc(100vh-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-lt border border-lt-border data-[state=open]:animate-lt-dialog-in data-[state=closed]:animate-lt-dialog-out",
			start: "inset-y-0 start-0 border-e border-lt-border data-[state=open]:animate-lt-sheet-in-start data-[state=closed]:animate-lt-sheet-out-start",
			end: "inset-y-0 end-0 border-s border-lt-border data-[state=open]:animate-lt-sheet-in-end data-[state=closed]:animate-lt-sheet-out-end"
		},
		width: {
			sm: "max-w-sm",
			md: "max-w-md",
			lg: "max-w-lg",
			xl: "max-w-xl",
			"2xl": "max-w-2xl",
			"3xl": "max-w-3xl"
		}
	},
	defaultVariants: {
		placement: "center",
		width: "lg"
	}
});
function Dialog(props) {
	return /* @__PURE__ */ jsx(DialogPrimitive.Root, {
		"data-slot": "dialog",
		...props
	});
}
function DialogClose(props) {
	return /* @__PURE__ */ jsx(DialogPrimitive.Close, {
		"data-slot": "dialog-close",
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ jsx(DialogPrimitive.Title, {
		className: cn("text-lg font-semibold leading-none tracking-tight", className),
		"data-slot": "dialog-title",
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ jsx(DialogPrimitive.Description, {
		className: cn("text-sm text-lt-muted-fg", className),
		"data-slot": "dialog-description",
		...props
	});
}
function DialogContent({ children, className, placement = "center", width = "lg", ...props }) {
	return /* @__PURE__ */ jsxs(DialogPrimitive.Portal, { children: [/* @__PURE__ */ jsx(DialogPrimitive.Overlay, {
		className: "fixed inset-0 z-lt-overlay bg-lt-overlay data-[state=open]:animate-lt-fade-in data-[state=closed]:animate-lt-fade-out",
		"data-slot": "dialog-overlay"
	}), /* @__PURE__ */ jsx(DialogPrimitive.Content, {
		className: cn(dialogContentVariants({
			placement,
			width
		}), className),
		"data-slot": "dialog-content",
		...props,
		children
	})] });
}
/**
* The shared dialog header: a title with an optional description and a ghost
* close button. Pass `description` as `undefined` to suppress the description
* and the matching `aria-describedby` wiring on the content.
*/
function DialogHeader({ closeLabel, description, title }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-start justify-between gap-4",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "grid gap-2",
			children: [/* @__PURE__ */ jsx(DialogTitle, { children: title }), description ? /* @__PURE__ */ jsx(DialogDescription, { children: description }) : null]
		}), /* @__PURE__ */ jsx(DialogClose, {
			asChild: true,
			children: /* @__PURE__ */ jsx(Button, {
				"aria-label": closeLabel,
				"data-test": "dialog-close",
				size: "icon",
				emphasis: "ghost",
				children: /* @__PURE__ */ jsx(Icon, {
					name: "x",
					"aria-hidden": "true",
					className: "size-lt-icon-md"
				})
			})
		})]
	});
}
//#endregion
export { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle };

//# sourceMappingURL=dialog.js.map