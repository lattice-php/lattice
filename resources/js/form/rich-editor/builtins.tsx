import { Details, DetailsContent, DetailsSummary } from "@tiptap/extension-details";
import { Highlight } from "@tiptap/extension-highlight";
import { TableKit } from "@tiptap/extension-table";
import { TextAlign } from "@tiptap/extension-text-align";
import type { Editor } from "@tiptap/core";
import type { StarterKitOptions } from "@tiptap/starter-kit";
import { useState } from "react";
import { cn } from "@lattice-php/lattice/lib/utils";
import { useT } from "@lattice-php/lattice/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@lattice-php/lattice/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@lattice-php/lattice/ui/popover";
import { seedRichEditorExtension, type ToolbarButton } from "./registry";
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

let registered = false;

/**
 * Called by the editor field when its chunk loads. Registration must be an
 * explicitly invoked export: the package ships side-effect-free modules, so a
 * bare `import "./builtins"` would be tree-shaken out of production builds.
 */
export function registerBuiltinRichEditorExtensions(): void {
  if (registered) {
    return;
  }

  registered = true;

  seedRichEditorExtension("bold", {
    group: "marks",
    starterKit: () => ({ bold: {} }),
    toolbar: () => [markButton("bold", "bold", "Bold", "bold")],
  });

  seedRichEditorExtension("italic", {
    group: "marks",
    starterKit: () => ({ italic: {} }),
    toolbar: () => [markButton("italic", "italic", "Italic", "italic")],
  });

  seedRichEditorExtension("strike", {
    group: "marks",
    starterKit: () => ({ strike: {} }),
    toolbar: () => [markButton("strikethrough", "strikethrough", "Strikethrough", "strike")],
  });

  seedRichEditorExtension("underline", {
    group: "marks",
    starterKit: () => ({ underline: {} }),
    toolbar: () => [markButton("underline", "underline", "Underline", "underline")],
  });

  seedRichEditorExtension("highlight", {
    group: "marks",
    extensions: () => [Highlight],
    toolbar: () => [markButton("highlight", "highlighter", "Highlight", "highlight")],
  });

  seedRichEditorExtension("code", {
    group: "marks",
    starterKit: () => ({ code: {} }),
    toolbar: () => [markButton("code", "code-xml", "Code", "code")],
  });

  seedRichEditorExtension("heading", {
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

  seedRichEditorExtension("bullet-list", {
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

  seedRichEditorExtension("ordered-list", {
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

  seedRichEditorExtension("blockquote", {
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

  seedRichEditorExtension("code-block", {
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

  seedRichEditorExtension("horizontal-rule", {
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

  seedRichEditorExtension("text-align", {
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

  seedRichEditorExtension("link", {
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

  seedRichEditorExtension("table", {
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

  seedRichEditorExtension("details", {
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

  seedRichEditorExtension("emoji", {
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
}
