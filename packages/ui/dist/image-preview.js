import { Button } from "./button.js";
import { useT } from "./i18n/instance.js";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "./dialog.js";
import { useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/image-preview.tsx
function PreviewableImage({ src, alt, previewable, width, height, className, testId }) {
	const { t } = useT("lattice");
	const [open, setOpen] = useState(false);
	const image = /* @__PURE__ */ jsx("img", {
		alt,
		src,
		width,
		height,
		className,
		style: width ? {
			width,
			height
		} : void 0
	});
	if (!previewable) return image;
	const openLabel = t("common.image.open-preview", "View image");
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("button", {
		type: "button",
		"data-test": testId,
		className: "cursor-zoom-in",
		"aria-label": openLabel,
		onClick: () => setOpen(true),
		children: image
	}), /* @__PURE__ */ jsx(Dialog, {
		open,
		onOpenChange: setOpen,
		children: /* @__PURE__ */ jsxs(DialogContent, {
			"aria-describedby": void 0,
			className: "max-h-[90vh] w-auto max-w-[90vw] border-none bg-transparent p-0 shadow-none",
			children: [
				/* @__PURE__ */ jsx(DialogTitle, {
					className: "sr-only",
					children: alt || openLabel
				}),
				/* @__PURE__ */ jsx("img", {
					alt,
					src,
					"data-slot": "image-lightbox",
					className: "max-h-[90vh] max-w-[90vw] rounded-lt object-contain"
				}),
				/* @__PURE__ */ jsx(DialogClose, {
					asChild: true,
					children: /* @__PURE__ */ jsx(Button, {
						icon: "x",
						"aria-label": t("common.close", "Close"),
						"data-test": "lightbox-close",
						size: "icon",
						emphasis: "ghost",
						className: "absolute top-2 right-2 bg-lt-bg/80 hover:bg-lt-bg"
					})
				})
			]
		})
	})] });
}
//#endregion
export { PreviewableImage };

//# sourceMappingURL=image-preview.js.map