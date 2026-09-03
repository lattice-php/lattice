import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { RendererComponent } from "@lattice-php/core";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import {
  cancelDragStartFromInteractive,
  combine,
  draggable,
  dropTargetForElements,
  preserveOffsetOnSource,
  setCustomNativeDragPreview,
} from "@lattice-php/lattice/dnd";
import type { Edge } from "@lattice-php/lattice/dnd";
import {
  blockDragData,
  blockDropTargetData,
  dragSourceOf,
  dropAllowed,
  dropEdgeOf,
  resolveDropTarget,
} from "../../dnd/block-dnd";
import { select } from "../../document/store";
import { findBlock } from "../../document/tree";
import { frameClasses } from "../../lib/frame-classes";
import { Frame } from "../view/frame";
import { BlockProvider } from "./block-context";
import { BlockToolbar } from "./block-toolbar";
import { useBlockType, useEditor, useEditorState } from "./editor-context";

const dropEdgeClass: Record<Edge, string> = {
  bottom:
    "after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:rounded-full after:bg-lt-primary",
  left: "",
  right: "",
  top: "before:absolute before:inset-x-0 before:-top-1.5 before:h-0.5 before:rounded-full before:bg-lt-primary",
};

const EditorFrameAdapter: RendererComponent<"blocks.frame"> = ({ node, children }) => {
  const { blockId: id, blockType, style } = node.props;
  const { t } = useT("blocks");
  const { store, types, registerBlock, styleClasses } = useEditor();
  const selected = useEditorState((state) => state.selectedId === id);
  const hasErrors = useEditorState((state) => state.errors[id] !== undefined);
  const document = useEditorState((state) => state.document);
  const type = useBlockType(blockType);
  const label = type?.label ?? blockType;
  const element = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLButtonElement>(null);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [dropEdge, setDropEdge] = useState<Edge | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [inlineToolbar, setInlineToolbar] = useState<ReactNode>(null);
  const entry = useMemo(() => findBlock(document, id), [document, id]);
  const exists = entry !== null;
  const currentStyle = entry?.node.style ?? style;
  const classes = useMemo(
    () => frameClasses(styleClasses, currentStyle),
    [currentStyle, styleClasses],
  );

  useEffect(() => {
    const current = element.current;
    registerBlock(id, current);

    return () => registerBlock(id, null);
  }, [id, registerBlock]);

  useEffect(() => {
    const current = element.current;

    if (!current || !exists) {
      return;
    }

    const dragHandle = handle.current;

    return combine(
      cancelDragStartFromInteractive(
        current,
        (target) => target.closest(".lt-blocks-ui") !== null && target !== dragHandle,
      ),
      draggable({
        element: current,
        ...(dragHandle ? { dragHandle } : {}),
        getInitialData: () => blockDragData(id, blockType),
        onDragStart: () => setDragging(true),
        onDrop: () => setDragging(false),
        onGenerateDragPreview: ({ location, nativeSetDragImage }) => {
          setCustomNativeDragPreview({
            getOffset: preserveOffsetOnSource({ element: current, input: location.current.input }),
            nativeSetDragImage,
            render: ({ container }) => {
              const clone = current.cloneNode(true) as HTMLElement;
              clone.style.width = `${current.offsetWidth}px`;
              clone.style.opacity = "0.85";
              container.appendChild(clone);

              return () => clone.remove();
            },
          });
        },
      }),
      dropTargetForElements({
        canDrop: ({ source }) => {
          const dragSource = dragSourceOf(source.data);

          return dragSource !== null && !(dragSource.kind === "block" && dragSource.id === id);
        },
        element: current,
        getData: ({ element: hit, input }) => blockDropTargetData(id, { element: hit, input }),
        getIsSticky: () => true,
        onDrag: ({ self, source }) => {
          const state = store.getState();
          const dragSource = dragSourceOf(source.data);
          const target = resolveDropTarget(state.document, [self], dragSource);
          const allowed =
            dragSource !== null &&
            target !== null &&
            dropAllowed(state.document, state.types, dragSource, target);
          setDropEdge(allowed ? dropEdgeOf(self.data) : null);
          setBlocked(!allowed);
        },
        onDragLeave: () => {
          setDropEdge(null);
          setBlocked(false);
        },
        onDrop: () => {
          setDropEdge(null);
          setBlocked(false);
        },
      }),
    );
  }, [blockType, exists, id, store, types]);

  return (
    <div
      ref={element}
      role="group"
      aria-label={t("blocks.editor.select-block", "Select {{label}}", { label })}
      tabIndex={0}
      data-test={`block-${id}`}
      data-block-id={id}
      data-block-type={blockType}
      data-block-width={currentStyle.width ?? "full"}
      data-selected={selected || undefined}
      data-drop-edge={dropEdge ?? undefined}
      data-drop-blocked={blocked || undefined}
      className={cn(
        "relative rounded-lt outline-none transition-shadow",
        selected && "ring-2 ring-lt-primary ring-offset-2 ring-offset-lt-surface",
        !selected && hovered && "ring-1 ring-lt-border",
        hasErrors && !selected && "ring-1 ring-lt-danger",
        dragging && "opacity-40",
        blocked && "cursor-not-allowed ring-1 ring-lt-danger",
        dropEdge && dropEdgeClass[dropEdge],
      )}
      onClick={(event) => {
        event.stopPropagation();
        store.setState((state) => select(state, id));
      }}
      onFocus={(event) => {
        if ((event.target as HTMLElement).closest("[data-block-id]") === event.currentTarget) {
          store.setState((state) => select(state, id));
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {selected && (
        <BlockToolbar
          id={id}
          label={label}
          icon={type?.icon ?? null}
          handleRef={handle}
          inlineToolbar={inlineToolbar}
        />
      )}
      {!selected && hovered && (
        <span className="pointer-events-none absolute -top-2.5 left-2 z-10 rounded-lt-xs bg-lt-fg px-1.5 text-[10px] font-medium text-lt-bg">
          {label}
        </span>
      )}
      <Frame classes={classes} anchor={currentStyle.anchor}>
        <BlockProvider id={id} type={blockType} setInlineToolbar={setInlineToolbar}>
          {children}
        </BlockProvider>
      </Frame>
    </div>
  );
};

export default EditorFrameAdapter;
