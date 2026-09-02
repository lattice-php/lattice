import { useMemo } from "react";
import { Icon } from "@lattice-php/ui/icons";
import { select } from "../../document/store";
import { pathTo } from "../../document/tree";
import { useEditor, useEditorState } from "./editor-context";

export function Breadcrumbs() {
  const { store, types, focusBlock } = useEditor();
  const document = useEditorState((state) => state.document);
  const selectedId = useEditorState((state) => state.selectedId);
  const path = useMemo(
    () => (selectedId ? pathTo(document, selectedId) : []),
    [document, selectedId],
  );

  if (path.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Block path"
      data-test="blocks-breadcrumbs"
      className="sticky bottom-0 flex items-center gap-1 border-t border-lt-border bg-lt-surface px-4 py-1.5 text-xs text-lt-muted-fg"
    >
      {path.map((entry, index) => {
        const label = types.find((type) => type.type === entry.node.type)?.label ?? entry.node.type;
        const last = index === path.length - 1;

        return (
          <span key={entry.node.id} className="flex items-center gap-1">
            {index > 0 && (
              <Icon name="chevron-right" className="size-lt-icon-sm" aria-hidden="true" />
            )}
            <button
              type="button"
              className={last ? "font-medium text-lt-fg" : "hover:text-lt-fg"}
              aria-current={last ? "location" : undefined}
              onClick={() => {
                store.setState((state) => select(state, entry.node.id));
                focusBlock(entry.node.id);
              }}
            >
              {label}
            </button>
          </span>
        );
      })}
    </nav>
  );
}
