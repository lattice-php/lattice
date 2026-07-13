import { Placeholder } from "@tiptap/extensions";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEffect, useMemo } from "react";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useT } from "@lattice-php/lattice/i18n";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { FormFieldFrame } from "@lattice-php/lattice/form/components/base/field";
import { useFormContext } from "@lattice-php/lattice/form/hooks/context";
import { useFieldScope } from "@lattice-php/lattice/form/hooks/field-scope";
import { useDependentField } from "@lattice-php/lattice/form/hooks/use-dependent-field";
import { useFieldCommit } from "@lattice-php/lattice/form/hooks/use-field-commit";
import { useFormValue } from "@lattice-php/lattice/form/hooks/values";
import { registerBuiltinRichEditorExtensions } from "@lattice-php/lattice/form/rich-editor/builtins";
import {
  assembleStarterKitOptions,
  assembleTiptapExtensions,
  assembleToolbar,
  resolveRichEditorExtensions,
  type ToolbarEntry,
} from "@lattice-php/lattice/form/rich-editor/registry";
import { ToolbarIconButton } from "@lattice-php/lattice/form/rich-editor/toolbar-button";

registerBuiltinRichEditorExtensions();

function Toolbar({ editor, items }: { editor: Editor; items: ToolbarEntry[] }) {
  const { t } = useT("lattice");

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-lt-border p-1">
      {items.map((item, index) => {
        if (item === "separator") {
          // eslint-disable-next-line react/no-array-index-key
          return <span key={`sep-${index}`} className="mx-1 h-5 w-px bg-lt-border" />;
        }

        if ("component" in item) {
          const Control = item.component;

          return <Control editor={editor} key={item.key} />;
        }

        const label = t(`form.editor.${item.key}`, item.label);

        return (
          <ToolbarIconButton
            active={item.isActive(editor)}
            disabled={item.isDisabled?.(editor) ?? false}
            icon={item.icon}
            key={item.key}
            label={label}
            onClick={() => item.run(editor)}
            testId={`editor-${item.key}`}
          />
        );
      })}
    </div>
  );
}

const RichEditorField: RendererComponent<"field.rich-editor"> = ({ node }) => {
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
  const initialContent =
    typeof storedValue === "object" && storedValue !== null
      ? (storedValue as object)
      : ((node.props.value as object | undefined) ?? "");

  const resolved = useMemo(
    () => resolveRichEditorExtensions(node.props.extensions),
    [node.props.extensions],
  );
  const toolbar = useMemo(() => assembleToolbar(resolved), [resolved]);
  const extensions = useMemo(
    () => [
      StarterKit.configure(assembleStarterKitOptions(resolved)),
      Placeholder.configure({ placeholder: node.props.placeholder ?? "" }),
      ...assembleTiptapExtensions(resolved),
    ],
    [resolved, node.props.placeholder],
  );

  const editor = useEditor({
    extensions,
    content: initialContent,
    editable: !locked,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "lattice-prose min-h-32 px-3 py-2 outline-none",
      },
    },
    onUpdate: ({ editor: instance }) => {
      change(name, instance.isEmpty ? null : instance.getJSON());
    },
    onBlur: () => {
      blur(name);
    },
  });

  useEffect(() => {
    editor?.setEditable(!locked);
  }, [editor, locked]);

  if (hidden) {
    return null;
  }

  const submittedValue = storedValue ? JSON.stringify(storedValue) : "";

  return (
    <FormFieldFrame
      error={errors[errorKey]}
      helperText={node.props.helperText ?? undefined}
      tooltip={node.props.tooltip ?? undefined}
      label={node.props.label ?? ""}
      name={domName}
      required={required}
    >
      <div
        className={cn(
          "overflow-hidden rounded-lt-sm border border-lt-input bg-transparent shadow-lt-xs focus-within:border-lt-ring focus-within:ring-[3px] focus-within:ring-lt-ring/50",
          locked && "opacity-60",
        )}
      >
        {editor && !locked && toolbar.length > 0 && <Toolbar editor={editor} items={toolbar} />}
        <EditorContent editor={editor} />
      </div>
      <input name={domName} type="hidden" value={submittedValue} />
    </FormFieldFrame>
  );
};

export default RichEditorField;
