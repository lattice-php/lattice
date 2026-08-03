import { useEffect, useMemo } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useT } from "@lattice-php/ui/i18n";
import { FormFieldFrame } from "@lattice-php/form/components/base/field";
import { useFormContext } from "@lattice-php/form/hooks/context";
import { useDependentField } from "@lattice-php/form/hooks/use-dependent-field";
import { useFieldScope } from "@lattice-php/form/hooks/field-scope";
import { useFormValue } from "@lattice-php/form/hooks/values";
import { useFieldCommit } from "@lattice-php/form/hooks/use-field-commit";
import { cn } from "@lattice-php/ui/lib/utils";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { registerBuiltinRichEditorExtensions } from "@lattice-php/form/rich-editor/builtins";
import { assembleStarterKitOptions, assembleTiptapExtensions, assembleToolbar, resolveRichEditorExtensions } from "@lattice-php/form/rich-editor/registry";
import { ToolbarIconButton } from "@lattice-php/form/rich-editor/toolbar-button";
//#region resources/js/components/fields/rich-editor-field.tsx
registerBuiltinRichEditorExtensions();
function Toolbar({ editor, items }) {
	const { t } = useT("lattice");
	return /* @__PURE__ */ jsx("div", {
		className: "flex flex-wrap items-center gap-0.5 border-b border-lt-border p-1",
		children: items.map((item, index) => {
			if (item === "separator") return /* @__PURE__ */ jsx("span", { className: "mx-1 h-5 w-px bg-lt-border" }, `sep-${index}`);
			if ("component" in item) {
				const Control = item.component;
				return /* @__PURE__ */ jsx(Control, { editor }, item.key);
			}
			const label = t(`form.editor.${item.key}`, item.label);
			return /* @__PURE__ */ jsx(ToolbarIconButton, {
				active: item.isActive(editor),
				disabled: item.isDisabled?.(editor) ?? false,
				icon: item.icon,
				label,
				onClick: () => item.run(editor),
				testId: `editor-${item.key}`
			}, item.key);
		})
	});
}
var RichEditorField = ({ node }) => {
	const { errors } = useFormContext();
	const { hidden, required, readOnly, disabled } = useDependentField(node);
	const { change, blur } = useFieldCommit();
	const name = node.props.name;
	const scope = useFieldScope();
	const globalValue = useFormValue(name);
	const storedValue = scope ? scope.getValue(name) : globalValue;
	const domName = scope ? scope.scopedName(name) : name;
	const errorKey = scope ? scope.errorKey(name) : name;
	const locked = readOnly || disabled;
	const initialContent = typeof storedValue === "object" && storedValue !== null ? storedValue : node.props.value ?? "";
	const resolved = useMemo(() => resolveRichEditorExtensions(node.props.extensions), [node.props.extensions]);
	const toolbar = useMemo(() => assembleToolbar(resolved), [resolved]);
	const extensions = useMemo(() => [
		StarterKit.configure(assembleStarterKitOptions(resolved)),
		Placeholder.configure({ placeholder: node.props.placeholder ?? "" }),
		...assembleTiptapExtensions(resolved)
	], [resolved, node.props.placeholder]);
	const editor = useEditor({
		extensions,
		content: initialContent,
		editable: !locked,
		immediatelyRender: false,
		shouldRerenderOnTransaction: true,
		editorProps: { attributes: { class: "lattice-prose min-h-32 px-3 py-2 outline-none" } },
		onUpdate: ({ editor: instance }) => {
			change(name, instance.isEmpty ? null : instance.getJSON());
		},
		onBlur: () => {
			blur(name);
		}
	});
	useEffect(() => {
		editor?.setEditable(!locked);
	}, [editor, locked]);
	if (hidden) return null;
	const submittedValue = storedValue ? JSON.stringify(storedValue) : "";
	return /* @__PURE__ */ jsx(FormFieldFrame, {
		error: errors[errorKey],
		helperText: node.props.helperText ?? void 0,
		tooltip: node.props.tooltip ?? void 0,
		label: node.props.label ?? "",
		id: domName,
		required,
		children: (controlProps) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
			...controlProps,
			className: cn("overflow-hidden rounded-lt-sm border border-lt-input bg-transparent shadow-lt-xs focus-within:border-lt-ring focus-within:ring-[length:var(--lt-ring-width)] focus-within:ring-lt-ring/50", locked && "opacity-60"),
			role: "group",
			children: [editor && !locked && toolbar.length > 0 && /* @__PURE__ */ jsx(Toolbar, {
				editor,
				items: toolbar
			}), /* @__PURE__ */ jsx(EditorContent, { editor })]
		}), /* @__PURE__ */ jsx("input", {
			name: domName,
			type: "hidden",
			value: submittedValue
		})] })
	});
};
//#endregion
export { RichEditorField as default };

//# sourceMappingURL=rich-editor-field.js.map