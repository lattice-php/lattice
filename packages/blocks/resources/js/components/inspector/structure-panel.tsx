import { useMemo } from "react";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { select } from "../../document/store";
import { flattenDocument } from "../../document/tree";
import { useEditor, useEditorState } from "../editor/editor-context";

export function StructurePanel() {
  const { t } = useT("blocks");
  const { store, types, focusBlock } = useEditor();
  const document = useEditorState((state) => state.document);
  const selectedId = useEditorState((state) => state.selectedId);
  const entries = useMemo(() => flattenDocument(document), [document]);

  if (entries.length === 0) {
    return (
      <p className="px-3 py-3 text-sm text-lt-muted-fg">
        {t("blocks.editor.empty", "This page has no blocks yet. Pick one from the library.")}
      </p>
    );
  }

  return (
    <ul
      className="py-2"
      data-test="blocks-structure"
      aria-label={t("blocks.editor.inspector.structure", "Structure")}
    >
      {entries.map((entry) => {
        const type = types.find((candidate) => candidate.type === entry.node.type);
        const selected = entry.node.id === selectedId;

        return (
          <li key={entry.node.id}>
            <button
              type="button"
              aria-current={selected || undefined}
              data-test={`structure-${entry.node.id}`}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1 text-left text-xs hover:bg-lt-accent hover:text-lt-accent-fg",
                selected && "bg-lt-accent font-medium text-lt-accent-fg",
              )}
              style={{ paddingLeft: `${0.75 + entry.depth * 0.9}rem` }}
              onClick={() => {
                store.setState((state) => select(state, entry.node.id));
                focusBlock(entry.node.id);
              }}
            >
              {type?.icon && <Icon name={type.icon} className="size-lt-icon-sm text-lt-muted-fg" />}
              <span className="truncate">{type?.label ?? entry.node.type}</span>
              {entry.slot && (
                <span className="ml-auto truncate text-[10px] text-lt-muted-fg">{entry.slot}</span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
