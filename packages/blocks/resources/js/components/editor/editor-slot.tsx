import { useEffect, useMemo, useRef, useState } from "react";
import type { RendererComponent } from "@lattice-php/core";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { dropTargetForElements } from "@lattice-php/lattice/dnd";
import {
  dragSourceOf,
  dropAllowed,
  resolveDropTarget,
  slotDropTargetData,
} from "../../dnd/block-dnd";
import { findBlock } from "../../document/tree";
import { BlockList } from "./block-list";
import { useEditor, useEditorState } from "./editor-context";
import { InsertMenu } from "./insert-menu";

const EditorSlotAdapter: RendererComponent<"blocks.slot"> = ({ node }) => {
  const { blockId, name, label } = node.props;
  const { t } = useT("blocks");
  const { store } = useEditor();
  const document = useEditorState((state) => state.document);
  const children = useMemo(
    () => findBlock(document, blockId)?.node.slots[name] ?? [],
    [blockId, document, name],
  );
  const ids = useMemo(() => children.map((child) => child.id), [children]);
  const element = useRef<HTMLDivElement>(null);
  const [dropState, setDropState] = useState<"allowed" | "blocked" | null>(null);

  useEffect(() => {
    const current = element.current;

    if (!current) {
      return;
    }

    return dropTargetForElements({
      canDrop: ({ source }) => dragSourceOf(source.data) !== null,
      element: current,
      getData: () => slotDropTargetData(blockId, name),
      onDragEnter: ({ source, self }) => {
        const state = store.getState();
        const dragSource = dragSourceOf(source.data);
        const target = resolveDropTarget(state.document, [self], dragSource);
        setDropState(
          dragSource && target && dropAllowed(state.document, state.types, dragSource, target)
            ? "allowed"
            : "blocked",
        );
      },
      onDragLeave: () => setDropState(null),
      onDrop: () => setDropState(null),
    });
  }, [blockId, name, store]);

  return (
    <div
      ref={element}
      data-test={`slot-${blockId}-${name}`}
      data-drop-state={dropState ?? undefined}
      className={cn(
        "relative flex min-h-16 min-w-0 flex-col gap-3 rounded-lt border border-dashed p-1.5 transition-colors",
        dropState === null && (ids.length === 0 ? "border-lt-border" : "border-transparent"),
        dropState === "allowed" && "border-lt-primary bg-lt-primary/5",
        dropState === "blocked" && "border-lt-danger bg-lt-danger/5",
      )}
    >
      <span className="pointer-events-none absolute -top-2 left-2 rounded-lt-xs bg-lt-surface px-1 text-[10px] font-medium uppercase tracking-wide text-lt-muted-fg">
        {label}
      </span>
      <BlockList ids={ids} />
      <InsertMenu
        compact
        target={{ index: ids.length, parentId: blockId, slot: name }}
        label={t("blocks.editor.add-to-slot", "Add block to {{slot}}", { slot: label })}
      />
    </div>
  );
};

export default EditorSlotAdapter;
