import type { Editor } from "@tiptap/core";
import { ToolbarIconButton } from "@lattice-php/form/rich-editor";
import type { ToolbarEntry } from "@lattice-php/form/rich-editor/registry";
import { useT } from "@lattice-php/ui/i18n";

/** The formatting controls of an inline rich-text editor, rendered inside the block toolbar. */
export function RichTextToolbar({ editor, items }: { editor: Editor; items: ToolbarEntry[] }) {
  const { t } = useT("lattice");

  return (
    <>
      {items.map((item, index) => {
        if (item === "separator") {
          return (
            <span
              key={`separator-${index}`}
              className="mx-1 h-4 w-px bg-lt-border"
              aria-hidden="true"
            />
          );
        }

        if ("component" in item) {
          const Control = item.component;

          return <Control editor={editor} key={item.key} />;
        }

        return (
          <ToolbarIconButton
            active={item.isActive(editor)}
            disabled={item.isDisabled?.(editor) ?? false}
            icon={item.icon}
            key={item.key}
            label={t(`form.editor.${item.key}`, item.label)}
            onClick={() => item.run(editor)}
            testId={`editor-${item.key}`}
          />
        );
      })}
    </>
  );
}
