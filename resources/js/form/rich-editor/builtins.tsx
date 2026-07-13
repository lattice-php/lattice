import { Details, DetailsContent, DetailsSummary } from "@tiptap/extension-details";
import { Highlight } from "@tiptap/extension-highlight";
import { TableKit } from "@tiptap/extension-table";
import { TextAlign } from "@tiptap/extension-text-align";
import type { Editor } from "@tiptap/core";
import type { StarterKitOptions } from "@tiptap/starter-kit";
import { useState } from "react";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useT } from "@lattice-php/lattice/i18n";
import type { EditorExtension } from "@lattice-php/lattice/types/generated";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@lattice-php/lattice/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@lattice-php/lattice/ui/popover";
import { registerRichEditorExtension, type ToolbarButton } from "./registry";
import { ToolbarIconButton } from "./toolbar-button";

type HeadingLevels = NonNullable<Exclude<StarterKitOptions["heading"], false>["levels"]>;

const ALL_HEADING_LEVELS = [1, 2, 3, 4, 5, 6];

const ALL_ALIGNMENTS = ["left", "center", "right", "justify"];

const DEFAULT_EMOJIS = [
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

/**
 * The set the editor falls back to when a node carries no `extensions` prop —
 * payloads from servers that predate configurable extensions. Mirrors
 * RichEditor::defaultExtensions() on the PHP side.
 */
export const DEFAULT_RICH_EDITOR_EXTENSIONS: EditorExtension[] = [
  { type: "bold" },
  { type: "italic" },
  { type: "strike" },
  { type: "underline" },
  { type: "highlight" },
  { type: "heading" },
  { type: "bullet-list" },
  { type: "ordered-list" },
  { type: "blockquote" },
  { type: "code-block" },
  { type: "horizontal-rule" },
  { type: "text-align" },
  { type: "link" },
  { type: "table" },
  { type: "details" },
  { type: "emoji" },
];

function headingLevels(levels: number[] | undefined): HeadingLevels {
  const valid = (levels ?? ALL_HEADING_LEVELS).filter((level) => level >= 1 && level <= 6);

  return (valid.length > 0 ? valid : ALL_HEADING_LEVELS) as HeadingLevels;
}

function HeadingMenu({ editor, levels }: { editor: Editor; levels: number[] }) {
  const { t } = useT("lattice");
  const label = t("form.editor.heading", "Heading");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ToolbarIconButton
          active={editor.isActive("heading")}
          icon="heading"
          label={label}
          testId="editor-heading"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-32">
        {levels.map((level) => (
          <DropdownMenuItem
            className={cn(
              editor.isActive("heading", { level }) && "bg-lt-accent text-lt-accent-fg",
            )}
            data-test={`editor-heading-${level}`}
            key={level}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: level as HeadingLevels[number] })
                .run()
            }
          >
            {t(`form.editor.heading-${level}`, `Heading ${level}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LinkControl({ editor }: { editor: Editor }) {
  const { t } = useT("lattice");
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const apply = () => {
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }

    setOpen(false);
  };

  return (
    <Popover
      onOpenChange={(next) => {
        if (next) {
          setUrl((editor.getAttributes("link").href as string | undefined) ?? "");
        }

        setOpen(next);
      }}
      open={open}
    >
      <PopoverTrigger asChild>
        <ToolbarIconButton
          active={editor.isActive("link")}
          icon="link"
          label={t("form.editor.link", "Link")}
          testId="editor-link"
        />
      </PopoverTrigger>
      <PopoverContent className="flex w-72 items-center gap-1 p-2">
        <input
          aria-label={t("form.editor.link-url", "Link URL")}
          className="h-7 min-w-0 flex-1 rounded-lt-sm border border-lt-input bg-transparent px-2 text-sm outline-none focus:border-lt-ring"
          data-test="editor-link-url"
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              apply();
            }
          }}
          placeholder="https://"
          type="url"
          value={url}
        />
        <ToolbarIconButton
          icon="check"
          label={t("form.editor.link-apply", "Apply link")}
          onClick={apply}
          testId="editor-link-apply"
        />
        {editor.isActive("link") && (
          <ToolbarIconButton
            icon="trash-2"
            label={t("form.editor.link-remove", "Remove link")}
            onClick={() => {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              setOpen(false);
            }}
            testId="editor-link-remove"
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

function EmojiPicker({ editor, emojis }: { editor: Editor; emojis: string[] }) {
  const { t } = useT("lattice");
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <ToolbarIconButton
          icon="smile"
          label={t("form.editor.insert-emoji", "Insert emoji")}
          testId="editor-emoji"
        />
      </PopoverTrigger>
      <PopoverContent className="grid grid-cols-8 gap-0.5 p-1">
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
      </PopoverContent>
    </Popover>
  );
}

function markButton(key: string, icon: string, label: string, mark: string): ToolbarButton {
  return {
    icon,
    key,
    label,
    isActive: (editor) => editor.isActive(mark),
    run: (editor) => editor.chain().focus().toggleMark(mark).run(),
  };
}

registerRichEditorExtension("bold", {
  group: "marks",
  starterKit: () => ({ bold: {} }),
  toolbar: () => [markButton("bold", "bold", "Bold", "bold")],
});

registerRichEditorExtension("italic", {
  group: "marks",
  starterKit: () => ({ italic: {} }),
  toolbar: () => [markButton("italic", "italic", "Italic", "italic")],
});

registerRichEditorExtension("strike", {
  group: "marks",
  starterKit: () => ({ strike: {} }),
  toolbar: () => [markButton("strikethrough", "strikethrough", "Strikethrough", "strike")],
});

registerRichEditorExtension("underline", {
  group: "marks",
  starterKit: () => ({ underline: {} }),
  toolbar: () => [markButton("underline", "underline", "Underline", "underline")],
});

registerRichEditorExtension("highlight", {
  group: "marks",
  extensions: () => [Highlight],
  toolbar: () => [markButton("highlight", "highlighter", "Highlight", "highlight")],
});

registerRichEditorExtension("heading", {
  starterKit: (props) => ({ heading: { levels: headingLevels(props.levels) } }),
  toolbar: (props) => {
    const levels = headingLevels(props.levels);

    return [
      {
        key: "heading",
        component: ({ editor }) => <HeadingMenu editor={editor} levels={levels} />,
      },
    ];
  },
});

registerRichEditorExtension("bullet-list", {
  group: "blocks",
  starterKit: () => ({ bulletList: {}, listItem: {} }),
  toolbar: () => [
    {
      icon: "list",
      key: "bullet-list",
      label: "Bullet list",
      isActive: (editor) => editor.isActive("bulletList"),
      run: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
  ],
});

registerRichEditorExtension("ordered-list", {
  group: "blocks",
  starterKit: () => ({ orderedList: {}, listItem: {} }),
  toolbar: () => [
    {
      icon: "list-ordered",
      key: "ordered-list",
      label: "Ordered list",
      isActive: (editor) => editor.isActive("orderedList"),
      run: (editor) => editor.chain().focus().toggleOrderedList().run(),
    },
  ],
});

registerRichEditorExtension("blockquote", {
  group: "blocks",
  starterKit: () => ({ blockquote: {} }),
  toolbar: () => [
    {
      icon: "quote",
      key: "blockquote",
      label: "Blockquote",
      isActive: (editor) => editor.isActive("blockquote"),
      run: (editor) => editor.chain().focus().toggleBlockquote().run(),
    },
  ],
});

registerRichEditorExtension("code-block", {
  group: "blocks",
  starterKit: () => ({ codeBlock: {} }),
  toolbar: () => [
    {
      icon: "code",
      key: "code-block",
      label: "Code block",
      isActive: (editor) => editor.isActive("codeBlock"),
      run: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    },
  ],
});

registerRichEditorExtension("horizontal-rule", {
  group: "blocks",
  starterKit: () => ({ horizontalRule: {} }),
  toolbar: () => [
    {
      icon: "minus",
      key: "horizontal-rule",
      label: "Horizontal rule",
      isActive: () => false,
      run: (editor) => editor.chain().focus().setHorizontalRule().run(),
    },
  ],
});

const ALIGNMENT_BUTTONS: Record<string, { icon: string; key: string; label: string }> = {
  left: { icon: "align-left", key: "align-left", label: "Align left" },
  center: { icon: "align-center", key: "align-center", label: "Align center" },
  right: { icon: "align-right", key: "align-right", label: "Align right" },
  justify: { icon: "align-justify", key: "justify", label: "Justify" },
};

registerRichEditorExtension("text-align", {
  extensions: (props) => [
    TextAlign.configure({
      alignments: props.alignments ?? ALL_ALIGNMENTS,
      types: ["heading", "paragraph"],
    }),
  ],
  toolbar: (props) =>
    (props.alignments ?? ALL_ALIGNMENTS)
      .filter((alignment) => alignment in ALIGNMENT_BUTTONS)
      .map((alignment) => ({
        ...ALIGNMENT_BUTTONS[alignment],
        isActive: (editor: Editor) => editor.isActive({ textAlign: alignment }),
        run: (editor: Editor) => editor.chain().focus().setTextAlign(alignment).run(),
      })),
});

registerRichEditorExtension("link", {
  starterKit: (props) => ({
    link: {
      openOnClick: props.openOnClick ?? false,
      ...(props.protocols ? { protocols: props.protocols } : {}),
    },
  }),
  toolbar: () => [
    {
      key: "link",
      component: ({ editor }) => <LinkControl editor={editor} />,
    },
  ],
});

registerRichEditorExtension("table", {
  group: "insert",
  extensions: () => [TableKit.configure({ table: { resizable: false } })],
  toolbar: (props) => [
    {
      icon: "table",
      key: "insert-table",
      label: "Insert table",
      isActive: (editor) => editor.isActive("table"),
      run: (editor) =>
        editor
          .chain()
          .focus()
          .insertTable({
            rows: props.rows ?? 3,
            cols: props.cols ?? 3,
            withHeaderRow: props.withHeaderRow ?? true,
          })
          .run(),
    },
    {
      icon: "columns-3",
      key: "add-column",
      label: "Add column",
      isActive: () => false,
      isDisabled: (editor) => !editor.can().addColumnAfter(),
      run: (editor) => editor.chain().focus().addColumnAfter().run(),
    },
    {
      icon: "rows-3",
      key: "add-row",
      label: "Add row",
      isActive: () => false,
      isDisabled: (editor) => !editor.can().addRowAfter(),
      run: (editor) => editor.chain().focus().addRowAfter().run(),
    },
    {
      icon: "trash-2",
      key: "delete-table",
      label: "Delete table",
      isActive: () => false,
      isDisabled: (editor) => !editor.can().deleteTable(),
      run: (editor) => editor.chain().focus().deleteTable().run(),
    },
  ],
});

registerRichEditorExtension("details", {
  group: "insert",
  extensions: () => [Details, DetailsSummary, DetailsContent],
  toolbar: () => [
    {
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
      },
    },
  ],
});

registerRichEditorExtension("emoji", {
  toolbar: (props) => {
    const emojis = props.emojis ?? DEFAULT_EMOJIS;

    return [
      {
        key: "insert-emoji",
        component: ({ editor }) => <EmojiPicker editor={editor} emojis={emojis} />,
      },
    ];
  },
});
