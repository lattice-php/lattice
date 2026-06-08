import { Link } from "@tiptap/extension-link";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
} from "lucide-react";
import { useEffect } from "react";
import { cn } from "@lattice/lib/utils";
import { getStringProp } from "@lattice/core/props";
import type { RendererComponent } from "@lattice/core/types";
import { FormFieldFrame } from "../base/field";
import { useFormContext } from "../context";
import { useDependentField } from "../use-dependent-field";
import { useFormValue, useSetFormValue } from "../values";

declare module "@lattice/core/types" {
  interface ComponentProps {
    "form.rich-editor": {
      conditions?: unknown;
      disabled?: boolean;
      hidden?: boolean;
      label?: string;
      name?: string;
      placeholder?: string;
      readonly?: boolean;
      required?: boolean;
      value?: unknown;
    };
  }
}

type ToolbarItem =
  | "separator"
  | {
      icon: typeof Bold;
      label: string;
      isActive: (editor: Editor) => boolean;
      run: (editor: Editor) => void;
    };

const toolbar: ToolbarItem[] = [
  { icon: Bold, label: "Bold", isActive: (e) => e.isActive("bold"), run: (e) => e.chain().focus().toggleBold().run() },
  { icon: Italic, label: "Italic", isActive: (e) => e.isActive("italic"), run: (e) => e.chain().focus().toggleItalic().run() },
  { icon: Strikethrough, label: "Strikethrough", isActive: (e) => e.isActive("strike"), run: (e) => e.chain().focus().toggleStrike().run() },
  "separator",
  { icon: Heading1, label: "Heading 1", isActive: (e) => e.isActive("heading", { level: 1 }), run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { icon: Heading2, label: "Heading 2", isActive: (e) => e.isActive("heading", { level: 2 }), run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { icon: Heading3, label: "Heading 3", isActive: (e) => e.isActive("heading", { level: 3 }), run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  "separator",
  { icon: List, label: "Bullet list", isActive: (e) => e.isActive("bulletList"), run: (e) => e.chain().focus().toggleBulletList().run() },
  { icon: ListOrdered, label: "Ordered list", isActive: (e) => e.isActive("orderedList"), run: (e) => e.chain().focus().toggleOrderedList().run() },
  { icon: Quote, label: "Blockquote", isActive: (e) => e.isActive("blockquote"), run: (e) => e.chain().focus().toggleBlockquote().run() },
  { icon: Code, label: "Code block", isActive: (e) => e.isActive("codeBlock"), run: (e) => e.chain().focus().toggleCodeBlock().run() },
  { icon: Minus, label: "Horizontal rule", isActive: () => false, run: (e) => e.chain().focus().setHorizontalRule().run() },
  "separator",
  {
    icon: LinkIcon,
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
];

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-lt-border p-1">
      {toolbar.map((item, index) =>
        item === "separator" ? (
          // eslint-disable-next-line react/no-array-index-key
          <span key={`sep-${index}`} className="mx-1 h-5 w-px bg-lt-border" />
        ) : (
          <button
            aria-label={item.label}
            aria-pressed={item.isActive(editor)}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-lt-sm text-lt-muted-fg transition-colors hover:bg-lt-accent hover:text-lt-accent-fg [&_svg]:size-4",
              item.isActive(editor) && "bg-lt-accent text-lt-accent-fg",
            )}
            key={item.label}
            onClick={() => item.run(editor)}
            title={item.label}
            type="button"
          >
            <item.icon />
          </button>
        ),
      )}
    </div>
  );
}

export const RichEditorComponent: RendererComponent<"form.rich-editor"> = ({ node }) => {
  const { clearErrors, errors, precognitive, validate } = useFormContext();
  const { hidden, required, readonly, disabled } = useDependentField(node);
  const name = getStringProp(node.props, "name");
  const setValue = useSetFormValue();
  const storedValue = useFormValue(name);
  const locked = readonly || disabled;
  const initialContent =
    typeof storedValue === "object" && storedValue !== null
      ? (storedValue as object)
      : (node.props?.value as object | undefined) ?? "";

  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: initialContent,
    editable: !locked,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap min-h-32 px-3 py-2 outline-none [&_:first-child]:mt-0",
      },
    },
    onUpdate: ({ editor: instance }) => {
      setValue(name, instance.isEmpty ? null : instance.getJSON());
      if (precognitive) {
        validate(name);
      } else {
        clearErrors(name);
      }
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
      label={getStringProp(node.props, "label")}
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
