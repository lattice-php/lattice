import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { materializeSchema, Renderer } from "@lattice-php/core";
import type { Schema } from "@lattice-php/core";
import { useCallAction } from "@lattice-php/action";
import { useNavigation } from "@lattice-php/ui/navigation";
import { cn } from "@lattice-php/ui/lib/utils";
import {
  cancelDragStartFromInteractive,
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
import { getCardActions, getCardUrl, type BoardCard } from "../../board-store";
import type { Board as BoardWireProps } from "../../generated";
import { BoardCardActions } from "./board-card-actions";

const CARD_INTERACTIVE_SELECTOR =
  "a, button, input, textarea, select, label, [contenteditable], [role=menuitem], [role=checkbox]";

function isCardInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(CARD_INTERACTIVE_SELECTOR) !== null;
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
  cardAction: BoardWireProps["cardAction"];
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
    cardAction,
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
  const { visit } = useNavigation();
  const runAction = useCallAction();
  const url = getCardUrl(card);
  const actions = getCardActions(card);

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

  const activate = useCallback(
    (options: { newTab?: boolean } = {}) => {
      if (url) {
        if (options.newTab) {
          window.open(url, "_blank");
        } else {
          visit(url);
        }

        return;
      }

      if (cardAction) {
        void runAction(cardAction, { cardId, columnKey });
      }
    },
    [cardAction, cardId, columnKey, runAction, url, visit],
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLLIElement>) => {
      if (isCardInteractiveTarget(event.target)) {
        return;
      }

      activate({ newTab: event.metaKey || event.ctrlKey });
    },
    [activate],
  );

  const handleAuxClick = useCallback(
    (event: MouseEvent<HTMLLIElement>) => {
      if (!url || event.button !== 1 || isCardInteractiveTarget(event.target)) {
        return;
      }

      window.open(url, "_blank");
    },
    [url],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLLIElement>) => {
      const direction = BOARD_FOCUS_KEYS[event.key];

      if (direction) {
        event.preventDefault();
        onMoveFocus(direction);
        return;
      }

      if (
        (event.key === "Enter" || event.key === " ") &&
        event.target === elementRef.current &&
        (url || cardAction)
      ) {
        event.preventDefault();
        activate();
      }
    },
    [activate, cardAction, onMoveFocus, url],
  );

  useEffect(() => {
    const element = elementRef.current;

    if (!element || !canMove) {
      return;
    }

    return combine(
      cancelDragStartFromInteractive(element, isCardInteractiveTarget),
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
        "lt-board-card relative rounded-lt border border-lt-border bg-lt-surface p-3 text-sm text-lt-surface-fg shadow-lt-sm",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lt-primary",
        canMove && "cursor-grab",
        (url || cardAction) && "cursor-pointer",
        dragging && "opacity-50",
        dropIndicatorClass(edge),
      )}
      data-drop-instruction={edge ?? undefined}
      data-test={testId}
      onAuxClick={handleAuxClick}
      onClick={handleClick}
      onFocus={onFocus}
      onKeyDown={handleKeyDown}
      ref={setRefs}
      role="listitem"
      tabIndex={tabIndex}
    >
      {actions.length > 0 ? (
        <BoardCardActions actions={actions} data-test={testId ? `${testId}-actions` : undefined} />
      ) : null}
      <Renderer nodes={materializeSchema(schema, card)} />
    </li>
  );
});
