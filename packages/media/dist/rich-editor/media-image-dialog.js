import { LibraryView } from "../components/library-view.js";
import { translate, useT } from "@lattice-php/ui/i18n";
import { jsx, jsxs } from "react/jsx-runtime";
import { Dialog, DialogContent, DialogHeader } from "@lattice-php/ui/dialog";
//#region resources/js/rich-editor/media-image-dialog.tsx
/**
* The picker dialog body for the media-image toolbar control, split out of
* media-image.tsx so it (and the media-library grid stack it pulls in) loads
* lazily instead of riding in the eager editor-extension bundle.
*/
function MediaImageDialog({ editor, library, setOpen }) {
	const { t } = useT("media");
	return /* @__PURE__ */ jsx(Dialog, {
		onOpenChange: setOpen,
		open: true,
		children: /* @__PURE__ */ jsxs(DialogContent, {
			"aria-describedby": void 0,
			className: "flex flex-col gap-5",
			"data-test": "editor-media-image-dialog",
			width: "3xl",
			children: [/* @__PURE__ */ jsx(DialogHeader, {
				closeLabel: translate("lattice", "common.close", "Close"),
				title: t("media.picker.heading", "Choose media")
			}), /* @__PURE__ */ jsx(LibraryView, {
				node: library,
				pick: {
					multiple: true,
					onConfirm: (items) => {
						editor.chain().focus().insertContent(items.map((item) => ({
							type: "mediaImage",
							attrs: {
								id: item.id,
								url: item.url,
								mediaAlt: item.alt
							}
						}))).run();
						setOpen(false);
					}
				}
			})]
		})
	});
}
//#endregion
export { MediaImageDialog as default };

//# sourceMappingURL=media-image-dialog.js.map