import { useEffect, useMemo, useRef, useState } from "react";
import { SegmentedControl } from "@lattice-php/ui/components/segmented-control/segmented-control";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { Input } from "@lattice-php/form/primitives/input";
import { draggable } from "@lattice-php/lattice/dnd";
import { libraryDragData } from "../../dnd/block-dnd";
import { insertTargetFor } from "../../document/store";
import type { BlockPatternData, BlockTypeData } from "../../types";
import { useEditor, useEditorState } from "./editor-context";

const categoryOrder = ["text", "media", "layout"];

type LibraryTab = "blocks" | "patterns";

export function LibraryPanel() {
  const { t } = useT("blocks");
  const { types } = useEditor();
  const patterns = useEditorState((state) => state.patterns);
  const [tab, setTab] = useState<LibraryTab>("blocks");
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

  const showTabs = patterns.length > 0;
  const activeTab: LibraryTab = showTabs ? tab : "blocks";

  return (
    <aside
      className="flex w-64 shrink-0 flex-col border-r border-lt-border bg-lt-surface"
      data-test="blocks-library"
      aria-label={t("blocks.editor.library", "Blocks")}
    >
      <div className="border-b border-lt-border px-3 py-2 text-sm font-semibold">
        {showTabs ? (
          <SegmentedControl
            aria-label={t("blocks.editor.library", "Blocks")}
            data-test="blocks-library-tabs"
            className="w-full"
            options={[
              { label: t("blocks.editor.library", "Blocks"), value: "blocks" },
              { label: t("blocks.editor.patterns", "Patterns"), value: "patterns" },
            ]}
            value={activeTab}
            onValueChange={(value) => setTab(value as LibraryTab)}
          />
        ) : (
          t("blocks.editor.library", "Blocks")
        )}
      </div>
      {activeTab === "blocks" ? (
        <>
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
        </>
      ) : (
        <ul className="flex flex-1 flex-col gap-2 overflow-y-auto p-3" data-test="blocks-patterns">
          {patterns.map((pattern) => (
            <li key={pattern.key}>
              <PatternItem pattern={pattern} />
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function LibraryItem({ type }: { type: BlockTypeData }) {
  const { store, insertBlock } = useEditor();
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

  const add = () => insertBlock(type.type, insertTargetFor(store.getState(), [type.type]));

  return (
    <button
      ref={element}
      type="button"
      title={type.description ?? type.label}
      data-test={`library-${type.type}`}
      className={cn(
        "flex h-16 w-full cursor-grab flex-col items-center justify-center gap-1 rounded-lt border border-lt-border bg-lt-surface px-1 text-[11px] text-lt-fg transition-colors hover:border-lt-primary hover:text-lt-primary focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-lt-ring/50 outline-none",
        dragging && "opacity-50",
      )}
      onClick={add}
    >
      {type.icon && <Icon name={type.icon} className="size-lt-icon-md" />}
      <span className="truncate">{type.label}</span>
    </button>
  );
}

function PatternItem({ pattern }: { pattern: BlockPatternData }) {
  const { store, insertPattern } = useEditor();
  const rootTypes = useMemo(() => pattern.blocks.map((block) => block.type), [pattern.blocks]);

  const add = () => insertPattern(pattern.key, insertTargetFor(store.getState(), rootTypes));

  return (
    <button
      type="button"
      data-test={`pattern-${pattern.key}`}
      className="flex w-full items-start gap-3 rounded-lt border border-lt-border bg-lt-surface px-3 py-2 text-start text-sm text-lt-fg transition-colors hover:border-lt-primary focus-visible:ring-[length:var(--lt-ring-width)] focus-visible:ring-lt-ring/50 outline-none"
      onClick={add}
    >
      {pattern.icon && (
        <Icon name={pattern.icon} className="mt-0.5 size-lt-icon-md shrink-0 text-lt-muted-fg" />
      )}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium">{pattern.label}</span>
        {pattern.description && (
          <span className="text-xs text-lt-muted-fg">{pattern.description}</span>
        )}
      </span>
    </button>
  );
}
