import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";
import { Input } from "@lattice-php/form/primitives/input";
import { announce, draggable } from "@lattice-php/lattice/dnd";
import { libraryDragData } from "../../dnd/block-dnd";
import { canPlace } from "../../document/rules";
import { insert } from "../../document/store";
import { findBlock } from "../../document/tree";
import type { BlockTarget, BlockTypeData } from "../../types";
import { useEditor, useEditorState } from "./editor-context";

const categoryOrder = ["text", "media", "layout", "embed"];

export function LibraryPanel() {
  const { t } = useT("blocks");
  const { types } = useEditor();
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matching = types.filter(
      (type) =>
        needle === "" ||
        type.label.toLowerCase().includes(needle) ||
        type.type.toLowerCase().includes(needle) ||
        type.keywords.some((keyword) => keyword.toLowerCase().includes(needle)),
    );
    const byCategory = new Map<string, BlockTypeData[]>();

    for (const type of matching) {
      byCategory.set(type.category, [...(byCategory.get(type.category) ?? []), type]);
    }

    return [...byCategory.entries()].sort(
      ([a], [b]) => (categoryOrder.indexOf(a) + 1 || 99) - (categoryOrder.indexOf(b) + 1 || 99),
    );
  }, [query, types]);

  return (
    <aside
      className="flex w-64 shrink-0 flex-col border-r border-lt-border bg-lt-surface"
      data-test="blocks-library"
      aria-label={t("blocks.editor.library", "Blocks")}
    >
      <div className="border-b border-lt-border px-3 py-2 text-sm font-semibold">
        {t("blocks.editor.library", "Blocks")}
      </div>
      <div className="px-3 py-2">
        <Input
          type="search"
          value={query}
          placeholder={t("blocks.editor.search", "Search blocks")}
          aria-label={t("blocks.editor.search", "Search blocks")}
          data-test="blocks-library-search"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {groups.length === 0 && (
          <p className="py-4 text-sm text-lt-muted-fg">
            {t("blocks.editor.no-results", "No blocks match.")}
          </p>
        )}
        {groups.map(([category, items]) => (
          <section key={category} className="mb-3">
            <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-lt-muted-fg">
              {t(`blocks.editor.categories.${category}`, category)}
            </h3>
            <ul className="grid grid-cols-3 gap-1.5">
              {items.map((type) => (
                <li key={type.type}>
                  <LibraryItem type={type} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  );
}

function LibraryItem({ type }: { type: BlockTypeData }) {
  const { t } = useT("blocks");
  const { store, requestRender, focusBlock } = useEditor();
  const selectedId = useEditorState((state) => state.selectedId);
  const element = useRef<HTMLButtonElement>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const current = element.current;

    if (!current) {
      return;
    }

    return draggable({
      element: current,
      getInitialData: () => libraryDragData(type.type),
      onDragStart: () => setDragging(true),
      onDrop: () => setDragging(false),
    });
  }, [type.type]);

  const add = () => {
    const state = store.getState();
    const selected = selectedId ? findBlock(state.document, selectedId) : null;
    const afterSelected: BlockTarget | null = selected
      ? { index: selected.index + 1, parentId: selected.parentId, slot: selected.slot }
      : null;
    const target: BlockTarget =
      afterSelected &&
      canPlace({
        blockType: type.type,
        document: state.document,
        parentId: afterSelected.parentId,
        slot: afterSelected.slot,
        types: state.types,
      })
        ? afterSelected
        : { index: state.document.blocks.length, parentId: null, slot: null };
    let created: string | null = null;

    store.setState((current) => {
      const result = insert(current, type.type, target);
      created = result.id;

      return result.state;
    });

    if (created) {
      requestRender(created);
      announce(t("blocks.editor.block-added", "{{label}} added", { label: type.label }));
      queueMicrotask(() => focusBlock(created as string));
    }
  };

  return (
    <button
      ref={element}
      type="button"
      title={type.description ?? type.label}
      data-test={`library-${type.type}`}
      className={`flex h-16 w-full cursor-grab flex-col items-center justify-center gap-1 rounded-lt border border-lt-border bg-lt-surface px-1 text-[11px] text-lt-fg transition-colors hover:border-lt-primary hover:text-lt-primary focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-lt-ring/50 outline-none ${dragging ? "opacity-50" : ""}`}
      onClick={add}
    >
      {type.icon && <Icon name={type.icon} className="size-lt-icon-md" />}
      <span className="truncate">{type.label}</span>
    </button>
  );
}
