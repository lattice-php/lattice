import { Placeholder } from "@tiptap/extensions";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEffect, useMemo, useRef } from "react";
import { cn } from "@lattice-php/ui/lib/utils";
import { useT } from "@lattice-php/ui/i18n";
import { useExtensionRegistry } from "@lattice-php/core/registry-context";
import type { RendererComponent } from "@lattice-php/core";
import { FormFieldFrame } from "../base/field";
import { fieldLabelAction } from "../base/label-action";
import { useFormContext } from "../../hooks/context";
import { useFieldScope } from "../../hooks/field-scope";
import { useDependentField } from "../../hooks/use-dependent-field";
import { useFieldCommit } from "../../hooks/use-field-commit";
import { useFormValue } from "../../hooks/values";
import { builtinRichEditorExtensions } from "../../rich-editor/builtins";
import { BlockMenuController } from "../../rich-editor/block-menu/block-menu-controller";
import {
  createSlashMenuExtension,
  type SlashMenuHandle,
} from "../../rich-editor/block-menu/slash-extension";
import {
  assembleBlockCommands,
  assembleStarterKitOptions,
  assembleTiptapExtensions,
  assembleToolbar,
  RICH_EDITOR_EXTENSION,
  resolveRichEditorExtensions,
  type BlockCommandEntry,
  type RichEditorExtensionRegistry,
  type ToolbarEntry,
} from "../../rich-editor/registry";
import { ToolbarIconButton } from "../../rich-editor/toolbar-button";

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
  const customExtensions = useExtensionRegistry<RichEditorExtensionRegistry>(RICH_EDITOR_EXTENSION);
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
    () =>
      resolveRichEditorExtensions(node.props.extensions, {
        ...builtinRichEditorExtensions,
        ...customExtensions,
      }),
    [customExtensions, node.props.extensions],
  );
  const toolbar = useMemo(() => assembleToolbar(resolved), [resolved]);
  const blockCommands = useMemo(() => assembleBlockCommands(resolved), [resolved]);
  const slashMenuEnabled = resolved.some((extension) => extension.type === "slash-menu");
  const blockCommandsRef = useRef<BlockCommandEntry[]>(blockCommands);
  const slashMenuHandleRef = useRef<SlashMenuHandle | null>(null);

  useEffect(() => {
    blockCommandsRef.current = blockCommands;
  }, [blockCommands]);

  const extensions = useMemo(
    () => [
      StarterKit.configure(assembleStarterKitOptions(resolved)),
      Placeholder.configure({ placeholder: node.props.placeholder ?? "" }),
      ...(slashMenuEnabled
        ? [
            createSlashMenuExtension({
              commands: () => blockCommandsRef.current,
              handle: slashMenuHandleRef,
            }),
          ]
        : []),
      ...assembleTiptapExtensions(resolved),
    ],
    [resolved, node.props.placeholder, slashMenuEnabled],
  );

  const editor = useEditor({
    extensions,
    content: initialContent,
    editable: !locked,
    immediatelyRender: false,
    // Tiptap v3 stops re-rendering per transaction by default, but the toolbar
    // reads isActive/isDisabled during render — without this, selection-only
    // transactions leave those states stale.
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        // The slash menu reserves a left gutter for the add-block plus button.
        class: cn("lattice-prose min-h-32 px-3 py-2 outline-none", slashMenuEnabled && "pl-9"),
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
      labelAction={fieldLabelAction(node.props.labelAction)}
      label={node.props.label ?? ""}
      id={domName}
      required={required}
    >
      {(controlProps) => (
        <>
          <div
            {...controlProps}
            className={cn(
              "overflow-hidden rounded-lt-sm border border-lt-input bg-transparent shadow-lt-xs focus-within:border-lt-ring focus-within:ring-[length:var(--lt-ring-width)] focus-within:ring-lt-ring/50",
              locked && "opacity-60",
            )}
            role="group"
          >
            {editor && !locked && node.props.toolbar && toolbar.length > 0 && (
              <Toolbar editor={editor} items={toolbar} />
            )}
            <EditorContent editor={editor} />
            {editor && !locked && slashMenuEnabled && (
              <BlockMenuController editor={editor} handleRef={slashMenuHandleRef} />
            )}
          </div>
          <input name={domName} type="hidden" value={submittedValue} />
        </>
      )}
    </FormFieldFrame>
  );
};

export default RichEditorField;
