import { Suspense, lazy, useState } from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { ToolbarIconButton, registerRichEditorExtension } from "@lattice-php/form/rich-editor";
import { useT } from "@lattice-php/ui/i18n";
import { Input } from "@lattice-php/ui/input";
import { cn } from "@lattice-php/ui/lib/utils";
import { NativeSelect } from "@lattice-php/ui/native-select";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/rich-editor/media-image.tsx
var MediaImageDialog = lazy(() => import("./media-image-dialog.js"));
function MediaImageView({ editor, extension, node, selected, updateAttributes }) {
	const { t } = useT("media");
	const conversions = extension.options.conversions;
	const url = node.attrs.url;
	const alt = node.attrs.alt ?? node.attrs.mediaAlt ?? "";
	return /* @__PURE__ */ jsxs(NodeViewWrapper, {
		className: "flex flex-col gap-2",
		"data-test": "editor-media-image",
		children: [url ? /* @__PURE__ */ jsx("img", {
			alt,
			className: cn("max-w-full rounded-lt-sm", selected && "ring-2 ring-lt-ring"),
			src: url
		}) : /* @__PURE__ */ jsx("div", {
			className: "rounded-lt-sm border border-dashed border-lt-border px-3 py-2 text-sm text-lt-fg-muted",
			"data-test": "editor-media-image-missing",
			children: t("media.editor.missing", "Missing media")
		}), selected && editor.isEditable && /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2",
			"data-test": "editor-media-image-controls",
			children: [/* @__PURE__ */ jsx(Input, {
				"aria-label": t("media.editor.alt", "Alt text"),
				onChange: (event) => updateAttributes({ alt: event.target.value === "" ? null : event.target.value }),
				placeholder: t("media.editor.alt", "Alt text"),
				value: node.attrs.alt ?? ""
			}), conversions.length > 0 && /* @__PURE__ */ jsxs(NativeSelect, {
				"aria-label": t("media.editor.size", "Size"),
				onChange: (event) => updateAttributes({ conversion: event.target.value === "" ? null : event.target.value }),
				value: node.attrs.conversion ?? "",
				children: [/* @__PURE__ */ jsx("option", {
					value: "",
					children: t("media.editor.original", "Original")
				}), conversions.map((name) => /* @__PURE__ */ jsx("option", {
					value: name,
					children: name
				}, name))]
			})]
		})]
	});
}
var MediaImageNode = Node.create({
	name: "mediaImage",
	group: "block",
	atom: true,
	draggable: true,
	addOptions() {
		return { conversions: [] };
	},
	addAttributes() {
		return {
			id: { default: null },
			alt: { default: null },
			conversion: { default: null },
			url: { default: null },
			width: { default: null },
			height: { default: null },
			mediaAlt: { default: null }
		};
	},
	parseHTML() {
		return [{ tag: "img[data-media-id]" }];
	},
	renderHTML({ node, HTMLAttributes }) {
		return ["img", mergeAttributes(HTMLAttributes, {
			src: node.attrs.url,
			alt: node.attrs.alt ?? node.attrs.mediaAlt ?? "",
			"data-media-id": node.attrs.id
		})];
	},
	addNodeView() {
		return ReactNodeViewRenderer(MediaImageView);
	}
});
function InsertMediaImageControl({ editor, library }) {
	const { t } = useT("media");
	const [open, setOpen] = useState(false);
	if (!library) return null;
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(ToolbarIconButton, {
		icon: "image",
		label: t("media.editor.insert", "Insert image"),
		onClick: () => setOpen(true),
		testId: "editor-media-image-insert"
	}), open && /* @__PURE__ */ jsx(Suspense, {
		fallback: null,
		children: /* @__PURE__ */ jsx(MediaImageDialog, {
			editor,
			library,
			setOpen
		})
	})] });
}
function registerMediaImage() {
	registerRichEditorExtension("media-image", {
		extensions: (props) => [MediaImageNode.configure({ conversions: props.conversions ?? [] })],
		toolbar: (props) => [{
			key: "media-image",
			component: ({ editor }) => /* @__PURE__ */ jsx(InsertMediaImageControl, {
				editor,
				library: props.library ?? null
			})
		}]
	});
}
//#endregion
export { MediaImageNode, MediaImageView, registerMediaImage };

//# sourceMappingURL=media-image.js.map