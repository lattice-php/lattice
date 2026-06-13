import { Icon } from "@lattice-php/lattice/icons";
import { Details, DetailsContent, DetailsSummary } from "@tiptap/extension-details";
import { Highlight } from "@tiptap/extension-highlight";
import { Link } from "@tiptap/extension-link";
import { TableKit } from "@tiptap/extension-table";
import { TextAlign } from "@tiptap/extension-text-align";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useT } from "@lattice-php/lattice/i18n";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { useFormContext } from "../context";
import { useDependentField } from "../use-dependent-field";
import { useFieldCommit } from "../use-field-commit";
import { useFormValue } from "../values";

type ToolbarItem =
  | "separator"
  | {
      icon: string;
      label: string;
      isActive: (editor: Editor) => boolean;
      isDisabled?: (editor: Editor) => boolean;
      run: (editor: Editor) => void;
    };

const toolbar: ToolbarItem[] = [
  {
    icon: "bold",
    label: "Bold",
    isActive: (e) => e.isActive("bold"),
    run: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    icon: "italic",
    label: "Italic",
    isActive: (e) => e.isActive("italic"),
    run: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    icon: "strikethrough",
    label: "Strikethrough",
    isActive: (e) => e.isActive("strike"),
    run: (e) => e.chain().focus().toggleStrike().run(),
  },
  {
    icon: "underline",
    label: "Underline",
    isActive: (e) => e.isActive("underline"),
    run: (e) => e.chain().focus().toggleUnderline().run(),
  },
  {
    icon: "highlighter",
    label: "Highlight",
    isActive: (e) => e.isActive("highlight"),
    run: (e) => e.chain().focus().toggleHighlight().run(),
  },
  "separator",
  {
    icon: "heading-1",
    label: "Heading 1",
    isActive: (e) => e.isActive("heading", { level: 1 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    icon: "heading-2",
    label: "Heading 2",
    isActive: (e) => e.isActive("heading", { level: 2 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    icon: "heading-3",
    label: "Heading 3",
    isActive: (e) => e.isActive("heading", { level: 3 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  "separator",
  {
    icon: "list",
    label: "Bullet list",
    isActive: (e) => e.isActive("bulletList"),
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    icon: "list-ordered",
    label: "Ordered list",
    isActive: (e) => e.isActive("orderedList"),
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    icon: "quote",
    label: "Blockquote",
    isActive: (e) => e.isActive("blockquote"),
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    icon: "code",
    label: "Code block",
    isActive: (e) => e.isActive("codeBlock"),
    run: (e) => e.chain().focus().toggleCodeBlock().run(),
  },
  {
    icon: "minus",
    label: "Horizontal rule",
    isActive: () => false,
    run: (e) => e.chain().focus().setHorizontalRule().run(),
  },
  "separator",
  {
    icon: "align-left",
    label: "Align left",
    isActive: (e) => e.isActive({ textAlign: "left" }),
    run: (e) => e.chain().focus().setTextAlign("left").run(),
  },
  {
    icon: "align-center",
    label: "Align center",
    isActive: (e) => e.isActive({ textAlign: "center" }),
    run: (e) => e.chain().focus().setTextAlign("center").run(),
  },
  {
    icon: "align-right",
    label: "Align right",
    isActive: (e) => e.isActive({ textAlign: "right" }),
    run: (e) => e.chain().focus().setTextAlign("right").run(),
  },
  {
    icon: "align-justify",
    label: "Justify",
    isActive: (e) => e.isActive({ textAlign: "justify" }),
    run: (e) => e.chain().focus().setTextAlign("justify").run(),
  },
  "separator",
  {
    icon: "link",
    label: "Link",
    isActive: (e) => e.isActive("link"),
    run: (e) => {
      if (e.isActive("link")) {
        e.chain().focus().unsetLink().run();
        return;
      }
      const url = window.prompt("Link URL");
      if (url) {
        e.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
      }
    },
  },
  "separator",
  {
    icon: "table",
    label: "Insert table",
    isActive: (e) => e.isActive("table"),
    run: (e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    icon: "columns-3",
    label: "Add column",
    isActive: () => false,
    isDisabled: (e) => !e.can().addColumnAfter(),
    run: (e) => e.chain().focus().addColumnAfter().run(),
  },
  {
    icon: "rows-3",
    label: "Add row",
    isActive: () => false,
    isDisabled: (e) => !e.can().addRowAfter(),
    run: (e) => e.chain().focus().addRowAfter().run(),
  },
  {
    icon: "trash-2",
    label: "Delete table",
    isActive: () => false,
    isDisabled: (e) => !e.can().deleteTable(),
    run: (e) => e.chain().focus().deleteTable().run(),
  },
  {
    icon: "chevron-right",
    label: "Details",
    isActive: (e) => e.isActive("details"),
    run: (e) => {
      if (e.isActive("details")) {
        e.chain().focus().unsetDetails().run();
        return;
      }
      e.chain().focus().setDetails().run();
    },
  },
];

const emojis = [
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
  "❤️",
];

function EmojiPicker({ editor }: { editor: Editor }) {
  const { t } = useT("lattice");
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-label={t("editor.insert-emoji", "Insert emoji")}
        data-test="editor-emoji"
        className="inline-flex size-7 items-center justify-center rounded-lt-sm text-lt-muted-fg transition-colors hover:bg-lt-accent hover:text-lt-accent-fg [&_svg]:size-lt-icon-md"
        onClick={() => setOpen((value) => !value)}
        onMouseDown={(event) => event.preventDefault()}
        title={t("editor.insert-emoji", "Insert emoji")}
        type="button"
      >
        <Icon name="smile" />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 grid grid-cols-8 gap-0.5 rounded-lt-sm border border-lt-border bg-lt-bg p-1 shadow-md">
          {emojis.map((emoji) => (
            <button
              className="inline-flex size-7 items-center justify-center rounded-lt-sm text-base hover:bg-lt-accent"
              key={emoji}
              onClick={() => {
                editor.chain().focus().insertContent(emoji).run();
                setOpen(false);
              }}
              onMouseDown={(event) => event.preventDefault()}
              type="button"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const { t } = useT("lattice");

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-lt-border p-1">
      {toolbar.map((item, index) => {
        if (item === "separator") {
          // eslint-disable-next-line react/no-array-index-key
          return <span key={`sep-${index}`} className="mx-1 h-5 w-px bg-lt-border" />;
        }

        const key = item.label.toLowerCase().replace(/\s+/g, "-");
        const label = t(`editor.${key}`, item.label);

        return (
          <button
            aria-label={label}
            aria-pressed={item.isActive(editor)}
            data-test={`editor-${key}`}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-lt-sm text-lt-muted-fg transition-colors hover:bg-lt-accent hover:text-lt-accent-fg disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-lt-icon-md",
              item.isActive(editor) && "bg-lt-accent text-lt-accent-fg",
            )}
            disabled={item.isDisabled?.(editor) ?? false}
            key={item.label}
            // Keep focus in the editor so toolbar clicks don't blur it (which would
            // otherwise trigger a precognition request).
            onClick={() => item.run(editor)}
            onMouseDown={(event) => event.preventDefault()}
            title={label}
            type="button"
          >
            <Icon name={item.icon} />
          </button>
        );
      })}
      <span className="mx-1 h-5 w-px bg-lt-border" />
      <EmojiPicker editor={editor} />
    </div>
  );
}

export const RichEditorComponent: RendererComponent<"form.rich-editor"> = ({ node }) => {
  const { errors } = useFormContext();
  const { hidden, required, readOnly, disabled } = useDependentField(node);
  const { change, blur } = useFieldCommit();
  const name = node.props.name;
  const storedValue = useFormValue(name);
  const locked = readOnly || disabled;
  const initialContent =
    typeof storedValue === "object" && storedValue !== null
      ? (storedValue as object)
      : ((node.props.value as object | undefined) ?? "");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      TableKit.configure({ table: { resizable: false } }),
      Details,
      DetailsSummary,
      DetailsContent,
    ],
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
      error={errors[name]}
      helperText={node.props.helperText ?? undefined}
      label={node.props.label ?? ""}
      name={name}
      required={required}
    >
      <div
        className={cn(
          "overflow-hidden rounded-lt-sm border border-lt-input bg-transparent shadow-xs focus-within:border-lt-ring focus-within:ring-[3px] focus-within:ring-lt-ring/50",
          locked && "opacity-60",
        )}
      >
        {editor && !locked && <Toolbar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
      <input name={name} type="hidden" value={submittedValue} />
    </FormFieldFrame>
  );
};
