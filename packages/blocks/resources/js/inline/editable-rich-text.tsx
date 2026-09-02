import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor as useTiptapEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEffect, useMemo, useRef } from "react";
import type { Node } from "@lattice-php/core";
import { useExtensionRegistry } from "@lattice-php/core";
import { RICH_EDITOR_EXTENSION } from "@lattice-php/form/rich-editor";
import { BlockMenuController } from "@lattice-php/form/rich-editor/block-menu/block-menu-controller";
import {
  createSlashMenuExtension,
  type SlashMenuHandle,
} from "@lattice-php/form/rich-editor/block-menu/slash-extension";
import { builtinRichEditorExtensions } from "@lattice-php/form/rich-editor/builtins";
import {
  assembleStarterKitOptions,
  assembleTiptapExtensions,
  assembleToolbar,
  resolveRichEditorExtensions,
  type BlockCommandEntry,
  type RichEditorExtensionRegistry,
} from "@lattice-php/form/rich-editor/registry";
import type { EditorExtension } from "@lattice-php/form/generated";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { allowedTypesFor } from "../document/rules";
import { updateBoundDocument } from "../document/store";
import { findBlock } from "../document/tree";
import { useEditor, useEditorState } from "../components/editor/editor-context";
import { RichTextToolbar } from "./rich-text-toolbar";
import { createTypingExtension, type RichTypingHandlers } from "./typing-extension";
import { isEmptyDocument, type RichDocument } from "./typing";
import type { BlockBinding } from "./use-block-binding";
import { useTypingHandlers } from "./use-typing";

function serialize(document: RichDocument | null | undefined): string {
  return isEmptyDocument(document) ? "" : JSON.stringify(document);
}

/**
 * A rich-text field edited in place with its own Tiptap instance. Undo belongs
 * to the block document, so Tiptap's history stays off; the slash menu offers
 * the blocks the surrounding slot accepts.
 */
export function EditableRichText({ node, binding }: { node: Node; binding: BlockBinding }) {
  const { t } = useT("blocks");
  const { store, inline, types } = useEditor();
  const { block, field } = binding;
  const typing = useTypingHandlers(block.id, field.name);
  const customExtensions = useExtensionRegistry<RichEditorExtensionRegistry>(RICH_EDITOR_EXTENSION);
  const value = (binding.value ?? null) as RichDocument | null;
  const placeholder =
    field.placeholder ??
    (node.props as { placeholder?: string | null }).placeholder ??
    t("blocks.placeholders.paragraph", "Write something or type / for blocks");
  const fieldExtensions = (field.node.props as { extensions?: EditorExtension[] }).extensions ?? [];
  const document = useEditorState((state) => state.document);
  const allowed = useMemo(() => {
    const entry = findBlock(document, block.id);

    return entry ? allowedTypesFor(document, types, entry.parentId, entry.slot) : [];
  }, [block.id, document, types]);

  const resolved = useMemo(
    () =>
      resolveRichEditorExtensions(fieldExtensions, {
        ...builtinRichEditorExtensions,
        ...customExtensions,
      }),
    [customExtensions, fieldExtensions],
  );
  const toolbar = useMemo(() => assembleToolbar(resolved), [resolved]);

  const typingRef = useRef<RichTypingHandlers | null>(null);
  const slashHandleRef = useRef<SlashMenuHandle | null>(null);
  const commandsRef = useRef<BlockCommandEntry[]>([]);
  const lastEmitted = useRef<string>(serialize(value));

  typingRef.current = {
    arrow: typing.arrow,
    mergeBackward: typing.mergeBackward,
    split: typing.splitRich,
  };

  commandsRef.current = allowed.map((type) => ({
    group: type.category,
    icon: type.icon ?? "square",
    key: type.type,
    keywords: type.keywords,
    label: type.label,
    run: (instance) => typing.insertType(type.type, instance.isEmpty),
  }));

  const extensions = useMemo(
    () => [
      StarterKit.configure({ ...assembleStarterKitOptions(resolved), undoRedo: false }),
      Placeholder.configure({ placeholder }),
      createTypingExtension(typingRef),
      createSlashMenuExtension({ commands: () => commandsRef.current, handle: slashHandleRef }),
      ...assembleTiptapExtensions(resolved),
    ],
    [placeholder, resolved],
  );

  const editor = useTiptapEditor({
    content: isEmptyDocument(value) ? "" : value,
    editorProps: {
      attributes: {
        class: cn("lattice-prose outline-none", (node.props as { class?: string }).class ?? ""),
        "data-test": `inline-${block.id}-${field.name}`,
      },
    },
    extensions,
    immediatelyRender: false,
    onFocus: ({ editor: instance }) =>
      block.setInlineToolbar(<RichTextToolbar editor={instance} items={toolbar} />),
    onUpdate: ({ editor: instance }) => {
      const next = instance.isEmpty ? null : (instance.getJSON() as RichDocument);
      lastEmitted.current = serialize(next);
      store.setState((state) => updateBoundDocument(state, block.id, field.name, next));
    },
    shouldRerenderOnTransaction: true,
  });

  useEffect(() => {
    if (!editor || serialize(value) === lastEmitted.current) {
      return;
    }

    lastEmitted.current = serialize(value);
    editor.commands.setContent(isEmptyDocument(value) ? "" : (value as object), {
      emitUpdate: false,
    });
  }, [editor, value]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    return inline.register(block.id, field.name, {
      append: (content) => {
        if (content.length === 0) {
          editor.commands.focus("end");

          return true;
        }

        const end = editor.state.doc.content.size;
        editor
          .chain()
          .focus()
          .insertContentAt(end, content as object[])
          .setTextSelection(end + 1)
          .joinBackward()
          .run();

        return true;
      },
      focus: (edge) => editor.commands.focus(edge),
    });
  }, [block, editor, field.name, inline]);

  useEffect(() => () => block.setInlineToolbar(null), [block]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className="lt-blocks-ui lt-blocks-rich"
      data-test={`inline-rich-${block.id}-${field.name}`}
    >
      <EditorContent editor={editor} />
      <BlockMenuController
        editor={editor}
        handleRef={slashHandleRef}
        plusButton={false}
        translate={(_, fallback) => fallback}
      />
    </div>
  );
}
