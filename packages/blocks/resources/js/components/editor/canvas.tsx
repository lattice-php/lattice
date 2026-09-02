import { useEffect, useMemo, useRef, useState } from "react";
import { RegistryProvider } from "@lattice-php/core";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import {
  announce,
  autoScrollForElements,
  combine,
  dropTargetForElements,
  monitorForElements,
} from "@lattice-php/lattice/dnd";
import {
  dragSourceOf,
  dropAllowed,
  resolveDropTarget,
  slotDropTargetData,
} from "../../dnd/block-dnd";
import { insert, move, select } from "../../document/store";
import { BlockList } from "./block-list";
import { Breadcrumbs } from "./breadcrumbs";
import { useEditor, useEditorState } from "./editor-context";
import { useEditorRegistry } from "./editor-registry";
import { InsertMenu } from "./insert-menu";

export function Canvas() {
  const { t } = useT("blocks");
  const { store, types, requestRender, focusBlock } = useEditor();
  const blocks = useEditorState((state) => state.document.blocks);
  const ids = useMemo(() => blocks.map((block) => block.id), [blocks]);
  const registry = useEditorRegistry();
  const scroller = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [dropActive, setDropActive] = useState(false);

  useEffect(() => {
    const scrollElement = scroller.current;
    const rootElement = root.current;

    if (!scrollElement || !rootElement) {
      return;
    }

    return combine(
      autoScrollForElements({ element: scrollElement }),
      dropTargetForElements({
        canDrop: ({ source }) => dragSourceOf(source.data) !== null,
        element: rootElement,
        getData: () => slotDropTargetData(null, null),
        onDragEnter: () => setDropActive(true),
        onDragLeave: () => setDropActive(false),
        onDrop: () => setDropActive(false),
      }),
      monitorForElements({
        canMonitor: ({ source }) => dragSourceOf(source.data) !== null,
        onDrop: ({ source, location }) => {
          const dragSource = dragSourceOf(source.data);
          const state = store.getState();
          const target = resolveDropTarget(
            state.document,
            location.current.dropTargets,
            dragSource,
          );

          if (!dragSource || !target) {
            return;
          }

          const typeLabel =
            types.find((type) => type.type === dragSource.blockType)?.label ?? dragSource.blockType;

          if (!dropAllowed(state.document, state.types, dragSource, target)) {
            announce(
              t("blocks.editor.drop-not-allowed", "{{label}} is not allowed here", {
                label: typeLabel,
              }),
            );

            return;
          }

          if (dragSource.kind === "block") {
            store.setState((current) => move(current, dragSource.id, target));
            announce(t("blocks.editor.block-moved", "{{label}} moved", { label: typeLabel }));
            queueMicrotask(() => focusBlock(dragSource.id));

            return;
          }

          let created: string | null = null;
          store.setState((current) => {
            const result = insert(current, dragSource.blockType, target);
            created = result.id;

            return result.state;
          });

          if (created) {
            requestRender(created);
            announce(t("blocks.editor.block-added", "{{label}} added", { label: typeLabel }));
          }
        },
      }),
    );
  }, [focusBlock, requestRender, store, t, types]);

  return (
    <div
      ref={scroller}
      className="lt-blocks-canvas relative min-w-0 flex-1 overflow-y-auto bg-lt-bg"
      data-test="blocks-canvas"
    >
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-6 py-8">
        <div
          ref={root}
          data-test="blocks-canvas-root"
          data-drop-active={dropActive || undefined}
          className={cn(
            "flex min-h-[60vh] flex-1 flex-col gap-4 rounded-lt border bg-lt-surface px-10 py-10 shadow-lt-sm transition-colors",
            dropActive ? "border-lt-primary" : "border-lt-border",
          )}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              store.setState((state) => select(state, null));
            }
          }}
        >
          <RegistryProvider registry={registry}>
            <BlockList ids={ids} />
          </RegistryProvider>
          {ids.length === 0 && (
            <p className="py-10 text-center text-sm text-lt-muted-fg" data-test="blocks-empty">
              {t("blocks.editor.empty", "This page has no blocks yet. Pick one from the library.")}
            </p>
          )}
          <InsertMenu
            target={{ index: ids.length, parentId: null, slot: null }}
            label={t("blocks.editor.add-block", "Add block")}
          />
        </div>
      </div>
      <Breadcrumbs />
    </div>
  );
}
