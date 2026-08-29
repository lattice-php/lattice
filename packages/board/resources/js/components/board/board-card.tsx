import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { materializeSchema, Renderer } from "@lattice-php/core";
import type { Schema } from "@lattice-php/core";
import { cn } from "@lattice-php/ui/lib/utils";
import {
  combine,
  draggable,
  dropTargetForElements,
  extractClosestEdge,
  pointerOutsideOfPreview,
  setCustomNativeDragPreview,
} from "@lattice-php/lattice/dnd";
import type { Edge } from "@lattice-php/lattice/dnd";
import { boardCardDragData, boardCardDropTargetData, boardDragSource } from "../../board-dnd";
import { BOARD_FOCUS_KEYS, type BoardFocusDirection } from "../../board-keyboard";
import type { BoardCard } from "../../board-store";

const FORM_CONTROL_SELECTOR = "input, textarea, select, label, [contenteditable]";

function isFormControlTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(FORM_CONTROL_SELECTOR) !== null;
}

function dropIndicatorClass(edge: Edge | null): string | null {
  switch (edge) {
    case "top":
      return "border-t-lt-primary";
    case "bottom":
      return "border-b-lt-primary";
    default:
      return null;
  }
}

export type BoardCardItemProps = {
  canMove: boolean;
  card: BoardCard;
  cardId: string;
  columnKey: string;
  "data-test"?: string;
  moving: boolean;
  onFocus: () => void;
  onMoveFocus: (direction: BoardFocusDirection) => void;
  schema: Schema;
  tabIndex: -1 | 0;
};

export const BoardCardItem = forwardRef<HTMLLIElement, BoardCardItemProps>(function BoardCardItem(
  {
    canMove,
    card,
    cardId,
    columnKey,
    "data-test": testId,
    moving,
    onFocus,
    onMoveFocus,
    schema,
    tabIndex,
  },
  forwardedRef,
) {
  const elementRef = useRef<HTMLLIElement>(null);
  const [dragging, setDragging] = useState(false);
  const [edge, setEdge] = useState<Edge | null>(null);

  const setRefs = useCallback(
    (element: HTMLLIElement | null) => {
      elementRef.current = element;

      if (typeof forwardedRef === "function") {
        forwardedRef(element);
      } else if (forwardedRef) {
        forwardedRef.current = element;
      }
    },
    [forwardedRef],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLLIElement>) => {
      const direction = BOARD_FOCUS_KEYS[event.key];

      if (!direction) {
        return;
      }

      event.preventDefault();
      onMoveFocus(direction);
    },
    [onMoveFocus],
  );

  useEffect(() => {
    const element = elementRef.current;

    if (!element || !canMove) {
      return;
    }

    // Browsers retarget dragstart to the closest draggable ancestor, so neither
    // canDrag() nor event.target can see an inline form control the gesture
    // started in; without this capture-phase cancel, selecting text in it drags
    // the card. The control is focused by the initiating mousedown, so a
    // focused control inside the card marks the drag as text selection.
    const cancelFormControlDrag = (event: Event): void => {
      const focused = element.ownerDocument.activeElement;

      if (
        isFormControlTarget(event.target) ||
        (element.contains(focused) && isFormControlTarget(focused))
      ) {
        event.preventDefault();
      }
    };

    element.addEventListener("dragstart", cancelFormControlDrag, true);

    return combine(
      () => element.removeEventListener("dragstart", cancelFormControlDrag, true),
      draggable({
        canDrag: () => !moving,
        element,
        getInitialData: () => boardCardDragData({ columnKey, id: cardId }),
        onDragStart: () => setDragging(true),
        onDrop: () => setDragging(false),
        onGenerateDragPreview: ({ nativeSetDragImage }) => {
          setCustomNativeDragPreview({
            getOffset: pointerOutsideOfPreview({ x: "16px", y: "8px" }),
            nativeSetDragImage,
            render: ({ container }) => {
              const clone = element.cloneNode(true) as HTMLElement;
              clone.style.width = `${element.offsetWidth}px`;
              clone.style.opacity = "0.9";
              container.appendChild(clone);

              return () => clone.remove();
            },
          });
        },
      }),
      dropTargetForElements({
        canDrop: ({ source }) => {
          const dragSource = boardDragSource(source.data);

          return dragSource !== null && dragSource.id !== cardId;
        },
        element,
        getData: ({ element: target, input }) =>
          boardCardDropTargetData({ cardId, columnKey }, { element: target, input }),
        onDrag: ({ self }) => setEdge(extractClosestEdge(self.data)),
        onDragEnter: ({ self }) => setEdge(extractClosestEdge(self.data)),
        onDragLeave: () => setEdge(null),
        onDrop: () => setEdge(null),
      }),
    );
  }, [canMove, cardId, columnKey, moving]);

  return (
    <li
      className={cn(
        "lt-board-card rounded-lt border border-lt-border bg-lt-surface p-3 text-sm text-lt-surface-fg shadow-lt-sm",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lt-primary",
        canMove && "cursor-grab",
        dragging && "opacity-50",
        dropIndicatorClass(edge),
      )}
      data-drop-instruction={edge ?? undefined}
      data-test={testId}
      onFocus={onFocus}
      onKeyDown={handleKeyDown}
      ref={setRefs}
      role="listitem"
      tabIndex={tabIndex}
    >
      <Renderer nodes={materializeSchema(schema, card)} />
    </li>
  );
});
