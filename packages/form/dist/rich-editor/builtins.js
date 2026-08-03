import { seedRichEditorExtension } from "./registry.js";
import { ToolbarIconButton } from "./toolbar-button.js";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useT } from "@lattice-php/ui/i18n";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@lattice-php/ui/dropdown-menu";
import { cn } from "@lattice-php/ui/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@lattice-php/ui/popover";
import { Details, DetailsContent, DetailsSummary } from "@tiptap/extension-details";
import { Highlight } from "@tiptap/extension-highlight";
import { TableKit } from "@tiptap/extension-table";
import { TextAlign } from "@tiptap/extension-text-align";
//#region resources/js/rich-editor/builtins.tsx
var ALL_HEADING_LEVELS = [
	1,
	2,
	3,
	4,
	5,
	6
];
var ALL_ALIGNMENTS = [
	"left",
	"center",
	"right",
	"justify"
];
var DEFAULT_EMOJIS = [
	"😀",
	"😅",
	"😂",
	"🥳",
	"😎",
	"🤔",
	"👍",
	"🙏",
	"🔥",
	"🎉",
	"🚀",
	"💡",
	"✅",
	"❌",
	"⭐",
	"❤️"
];
function headingLevels(levels) {
	const valid = (levels ?? ALL_HEADING_LEVELS).filter((level) => level >= 1 && level <= 6);
	return valid.length > 0 ? valid : ALL_HEADING_LEVELS;
}
function HeadingMenu({ editor, levels }) {
	const { t } = useT("lattice");
	const label = t("form.editor.heading", "Heading");
	return /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ jsx(ToolbarIconButton, {
			active: editor.isActive("heading"),
			icon: "heading",
			label,
			testId: "editor-heading"
		})
	}), /* @__PURE__ */ jsx(DropdownMenuContent, {
		className: "min-w-32",
		children: levels.map((level) => /* @__PURE__ */ jsx(DropdownMenuItem, {
			className: cn(editor.isActive("heading", { level }) && "bg-lt-accent text-lt-accent-fg"),
			"data-test": `editor-heading-${level}`,
			onClick: () => editor.chain().focus().toggleHeading({ level }).run(),
			children: t(`form.editor.heading-${level}`, `Heading ${level}`)
		}, level))
	})] });
}
function LinkControl({ editor }) {
	const { t } = useT("lattice");
	const [open, setOpen] = useState(false);
	const [url, setUrl] = useState("");
	const apply = () => {
		if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
		else editor.chain().focus().extendMarkRange("link").unsetLink().run();
		setOpen(false);
	};
	return /* @__PURE__ */ jsxs(Popover, {
		onOpenChange: (next) => {
			if (next) setUrl(editor.getAttributes("link").href ?? "");
			setOpen(next);
		},
		open,
		children: [/* @__PURE__ */ jsx(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ jsx(ToolbarIconButton, {
				active: editor.isActive("link"),
				icon: "link",
				label: t("form.editor.link", "Link"),
				testId: "editor-link"
			})
		}), /* @__PURE__ */ jsxs(PopoverContent, {
			className: "flex w-72 items-center gap-1 p-2",
			children: [
				/* @__PURE__ */ jsx("input", {
					"aria-label": t("form.editor.link-url", "Link URL"),
					className: "h-7 min-w-0 flex-1 rounded-lt-sm border border-lt-input bg-transparent px-2 text-sm outline-none focus:border-lt-ring",
					"data-test": "editor-link-url",
					onChange: (event) => setUrl(event.target.value),
					onKeyDown: (event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							apply();
						}
					},
					placeholder: "https://",
					type: "url",
					value: url
				}),
				/* @__PURE__ */ jsx(ToolbarIconButton, {
					icon: "check",
					label: t("form.editor.link-apply", "Apply link"),
					onClick: apply,
					testId: "editor-link-apply"
				}),
				editor.isActive("link") && /* @__PURE__ */ jsx(ToolbarIconButton, {
					icon: "trash-2",
					label: t("form.editor.link-remove", "Remove link"),
					onClick: () => {
						editor.chain().focus().extendMarkRange("link").unsetLink().run();
						setOpen(false);
					},
					testId: "editor-link-remove"
				})
			]
		})]
	});
}
function EmojiPicker({ editor, emojis }) {
	const { t } = useT("lattice");
	const [open, setOpen] = useState(false);
	return /* @__PURE__ */ jsxs(Popover, {
		onOpenChange: setOpen,
		open,
		children: [/* @__PURE__ */ jsx(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ jsx(ToolbarIconButton, {
				icon: "smile",
				label: t("form.editor.insert-emoji", "Insert emoji"),
				testId: "editor-emoji"
			})
		}), /* @__PURE__ */ jsx(PopoverContent, {
			className: "grid grid-cols-8 gap-0.5 p-1",
			children: emojis.map((emoji) => /* @__PURE__ */ jsx("button", {
				className: "inline-flex size-7 items-center justify-center rounded-lt-sm text-base hover:bg-lt-accent",
				onClick: () => {
					editor.chain().focus().insertContent(emoji).run();
					setOpen(false);
				},
				onMouseDown: (event) => event.preventDefault(),
				type: "button",
				children: emoji
			}, emoji))
		})]
	});
}
function markButton(key, icon, label, mark) {
	return {
		icon,
		key,
		label,
		isActive: (editor) => editor.isActive(mark),
		run: (editor) => editor.chain().focus().toggleMark(mark).run()
	};
}
var registered = false;
/**
* Called by the editor field when its chunk loads. Registration must be an
* explicitly invoked export: the package ships side-effect-free modules, so a
* bare `import "./builtins"` would be tree-shaken out of production builds.
*/
function registerBuiltinRichEditorExtensions() {
	if (registered) return;
	registered = true;
	seedRichEditorExtension("bold", {
		group: "marks",
		starterKit: () => ({ bold: {} }),
		toolbar: () => [markButton("bold", "bold", "Bold", "bold")]
	});
	seedRichEditorExtension("italic", {
		group: "marks",
		starterKit: () => ({ italic: {} }),
		toolbar: () => [markButton("italic", "italic", "Italic", "italic")]
	});
	seedRichEditorExtension("strike", {
		group: "marks",
		starterKit: () => ({ strike: {} }),
		toolbar: () => [markButton("strikethrough", "strikethrough", "Strikethrough", "strike")]
	});
	seedRichEditorExtension("underline", {
		group: "marks",
		starterKit: () => ({ underline: {} }),
		toolbar: () => [markButton("underline", "underline", "Underline", "underline")]
	});
	seedRichEditorExtension("highlight", {
		group: "marks",
		extensions: () => [Highlight],
		toolbar: () => [markButton("highlight", "highlighter", "Highlight", "highlight")]
	});
	seedRichEditorExtension("code", {
		group: "marks",
		starterKit: () => ({ code: {} }),
		toolbar: () => [markButton("code", "code-xml", "Code", "code")]
	});
	seedRichEditorExtension("heading", {
		starterKit: (props) => ({ heading: { levels: headingLevels(props.levels) } }),
		toolbar: (props) => {
			const levels = headingLevels(props.levels);
			return [{
				key: "heading",
				component: ({ editor }) => /* @__PURE__ */ jsx(HeadingMenu, {
					editor,
					levels
				})
			}];
		}
	});
	seedRichEditorExtension("bullet-list", {
		group: "blocks",
		starterKit: () => ({
			bulletList: {},
			listItem: {}
		}),
		toolbar: () => [{
			icon: "list",
			key: "bullet-list",
			label: "Bullet list",
			isActive: (editor) => editor.isActive("bulletList"),
			run: (editor) => editor.chain().focus().toggleBulletList().run()
		}]
	});
	seedRichEditorExtension("ordered-list", {
		group: "blocks",
		starterKit: () => ({
			orderedList: {},
			listItem: {}
		}),
		toolbar: () => [{
			icon: "list-ordered",
			key: "ordered-list",
			label: "Ordered list",
			isActive: (editor) => editor.isActive("orderedList"),
			run: (editor) => editor.chain().focus().toggleOrderedList().run()
		}]
	});
	seedRichEditorExtension("blockquote", {
		group: "blocks",
		starterKit: () => ({ blockquote: {} }),
		toolbar: () => [{
			icon: "quote",
			key: "blockquote",
			label: "Blockquote",
			isActive: (editor) => editor.isActive("blockquote"),
			run: (editor) => editor.chain().focus().toggleBlockquote().run()
		}]
	});
	seedRichEditorExtension("code-block", {
		group: "blocks",
		starterKit: () => ({ codeBlock: {} }),
		toolbar: () => [{
			icon: "code",
			key: "code-block",
			label: "Code block",
			isActive: (editor) => editor.isActive("codeBlock"),
			run: (editor) => editor.chain().focus().toggleCodeBlock().run()
		}]
	});
	seedRichEditorExtension("horizontal-rule", {
		group: "blocks",
		starterKit: () => ({ horizontalRule: {} }),
		toolbar: () => [{
			icon: "minus",
			key: "horizontal-rule",
			label: "Horizontal rule",
			isActive: () => false,
			run: (editor) => editor.chain().focus().setHorizontalRule().run()
		}]
	});
	const ALIGNMENT_BUTTONS = {
		left: {
			icon: "align-left",
			key: "align-left",
			label: "Align left"
		},
		center: {
			icon: "align-center",
			key: "align-center",
			label: "Align center"
		},
		right: {
			icon: "align-right",
			key: "align-right",
			label: "Align right"
		},
		justify: {
			icon: "align-justify",
			key: "justify",
			label: "Justify"
		}
	};
	seedRichEditorExtension("text-align", {
		extensions: (props) => [TextAlign.configure({
			alignments: props.alignments ?? ALL_ALIGNMENTS,
			types: ["heading", "paragraph"]
		})],
		toolbar: (props) => (props.alignments ?? ALL_ALIGNMENTS).filter((alignment) => alignment in ALIGNMENT_BUTTONS).map((alignment) => ({
			...ALIGNMENT_BUTTONS[alignment],
			isActive: (editor) => editor.isActive({ textAlign: alignment }),
			run: (editor) => editor.chain().focus().setTextAlign(alignment).run()
		}))
	});
	seedRichEditorExtension("link", {
		starterKit: (props) => ({ link: {
			openOnClick: props.openOnClick ?? false,
			...props.protocols ? { protocols: props.protocols } : {}
		} }),
		toolbar: () => [{
			key: "link",
			component: ({ editor }) => /* @__PURE__ */ jsx(LinkControl, { editor })
		}]
	});
	seedRichEditorExtension("table", {
		group: "insert",
		extensions: () => [TableKit.configure({ table: { resizable: false } })],
		toolbar: (props) => [
			{
				icon: "table",
				key: "insert-table",
				label: "Insert table",
				isActive: (editor) => editor.isActive("table"),
				run: (editor) => editor.chain().focus().insertTable({
					rows: props.rows ?? 3,
					cols: props.cols ?? 3,
					withHeaderRow: props.withHeaderRow ?? true
				}).run()
			},
			{
				icon: "columns-3",
				key: "add-column",
				label: "Add column",
				isActive: () => false,
				isDisabled: (editor) => !editor.can().addColumnAfter(),
				run: (editor) => editor.chain().focus().addColumnAfter().run()
			},
			{
				icon: "rows-3",
				key: "add-row",
				label: "Add row",
				isActive: () => false,
				isDisabled: (editor) => !editor.can().addRowAfter(),
				run: (editor) => editor.chain().focus().addRowAfter().run()
			},
			{
				icon: "trash-2",
				key: "delete-table",
				label: "Delete table",
				isActive: () => false,
				isDisabled: (editor) => !editor.can().deleteTable(),
				run: (editor) => editor.chain().focus().deleteTable().run()
			}
		]
	});
	seedRichEditorExtension("details", {
		group: "insert",
		extensions: () => [
			Details,
			DetailsSummary,
			DetailsContent
		],
		toolbar: () => [{
			icon: "chevron-right",
			key: "details",
			label: "Details",
			isActive: (editor) => editor.isActive("details"),
			run: (editor) => {
				if (editor.isActive("details")) {
					editor.chain().focus().unsetDetails().run();
					return;
				}
				editor.chain().focus().setDetails().run();
			}
		}]
	});
	seedRichEditorExtension("emoji", { toolbar: (props) => {
		const emojis = props.emojis ?? DEFAULT_EMOJIS;
		return [{
			key: "insert-emoji",
			component: ({ editor }) => /* @__PURE__ */ jsx(EmojiPicker, {
				editor,
				emojis
			})
		}];
	} });
}
//#endregion
export { registerBuiltinRichEditorExtensions };

//# sourceMappingURL=builtins.js.map