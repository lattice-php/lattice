import { useEffect, useId, useRef, useState } from "react";
import type { Schema } from "@lattice-php/core";
import { useT } from "@lattice-php/ui/i18n";
import { IconRenderer } from "@lattice-php/ui/icons";
import { Badge } from "@lattice-php/ui/components/badge/badge";
import { coerceColor, namedColor, toneProps } from "@lattice-php/ui/lib/color";
import { cn } from "@lattice-php/ui/lib/utils";
import { autoScrollForElements, combine, dropTargetForElements } from "@lattice-php/lattice/dnd";
import {
  boardColumnDropTargetData,
  boardDragSource,
  boardDropTarget,
  type BoardDropTarget,
} from "../../board-dnd";
import type { BoardFocusDirection } from "../../board-keyboard";
import type { BoardCardRemoval, BoardColumnView } from "../../use-board-state";
import type { Board as BoardWireProps, BoardColumnData } from "../../generated";
import { cardKey } from "../../board-store";
import { BoardCardItem } from "./board-card";
import { QuickAdd } from "./quick-add";

type CardPlaceholder = { height: number; index: number };

function dropPlaceholder(placeholder: CardPlaceholder) {
  return (
    <li
      aria-hidden
      className="shrink-0 rounded-lt border-2 border-dashed border-lt-primary/40 bg-lt-primary/5"
      key="drop-placeholder"
      style={{ height: placeholder.height }}
    />
  );
}

/**
 * Where the drop gap opens in this column's card list, mirroring the drop
 * intent the same hover would produce: above/below the hovered card, or at
 * the end for the column's empty space. Null when the hover targets another
 * column.
 */
function placeholderIndexFor(
  target: BoardDropTarget,
  cardIds: string[],
  columnKey: string,
): number | null {
  if (target.type === "column") {
    return target.columnKey === columnKey ? cardIds.length : null;
  }

  if (target.columnKey !== columnKey) {
    return null;
  }

  const index = cardIds.indexOf(target.cardId);

  if (index === -1) {
    return null;
  }

  return target.edge === "bottom" ? index + 1 : index;
}

export type BoardColumnProps = {
  canMove: boolean;
  cardAction: BoardWireProps["cardAction"];
  cardSchema: Schema;
  column: BoardColumnData;
  createAction: BoardWireProps["createAction"];
  focusedCardId: string | null;
  moving: boolean;
  onFocusCard: (cardId: string) => void;
  onLoadMore: () => void;
  onMoveFocus: (cardId: string, direction: BoardFocusDirection) => void;
  onResetColumn: () => void;
  registerCardRef: (cardId: string, element: HTMLLIElement | null) => void;
  removeCard: (cardId: string) => BoardCardRemoval | null;
  restoreCard: (removal: BoardCardRemoval | null) => void;
  view: BoardColumnView;
};

export function BoardColumn({
  canMove,
  cardAction,
  cardSchema,
  column,
  createAction,
  focusedCardId,
  moving,
  onFocusCard,
  onLoadMore,
  onMoveFocus,
  onResetColumn,
  registerCardRef,
  removeCard,
  restoreCard,
  view,
}: BoardColumnProps) {
  const { t } = useT("board");
  const headingId = useId();
  const tone = toneProps(coerceColor(column.color ?? undefined) ?? namedColor("gray"));
  const listRef = useRef<HTMLUListElement>(null);
  const [placeholder, setPlaceholder] = useState<CardPlaceholder | null>(null);
  const cardIdsRef = useRef<string[]>([]);
  cardIdsRef.current = view.cards.map((card) => cardKey(card));

  useEffect(() => {
    const element = listRef.current;

    if (!element || !canMove) {
      return;
    }

    const updatePlaceholder = ({
      location,
      source,
    }: {
      location: { current: { dropTargets: readonly { data: Record<string | symbol, unknown> }[] } };
      source: { element: HTMLElement };
    }) => {
      const target = boardDropTarget(location.current.dropTargets);
      const index = target ? placeholderIndexFor(target, cardIdsRef.current, column.key) : null;

      if (index === null) {
        setPlaceholder(null);
        return;
      }

      const height = source.element.getBoundingClientRect().height;

      setPlaceholder((current) =>
        current !== null && current.index === index && current.height === height
          ? current
          : { height, index },
      );
    };

    return combine(
      dropTargetForElements({
        canDrop: ({ source }) => boardDragSource(source.data) !== null,
        element,
        getData: () => boardColumnDropTargetData(column.key),
        onDrag: updatePlaceholder,
        onDragEnter: updatePlaceholder,
        onDragLeave: () => setPlaceholder(null),
        onDrop: () => setPlaceholder(null),
      }),
      autoScrollForElements({ element }),
    );
  }, [canMove, column.key]);

  return (
    <section className="lt-board-column" data-test={`board-column-${column.key}`}>
      <header className="flex items-center gap-2 pb-2">
        {column.icon ? (
          <IconRenderer
            className={cn("size-lt-icon-md shrink-0", tone.className)}
            icon={column.icon}
          />
        ) : null}
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-lt-fg" id={headingId}>
          {column.label}
        </h3>
        <Badge
          aria-label={t("board.card-count", "Cards: {{count}}", { count: view.total })}
          className={tone.className}
          style={tone.style}
        >
          {view.total}
        </Badge>
      </header>
      <ul aria-labelledby={headingId} className="lt-board-column-list" ref={listRef} role="list">
        {view.cards.flatMap((card, index) => {
          const id = cardKey(card);
          const item = (
            <BoardCardItem
              canMove={canMove}
              card={card}
              cardAction={cardAction}
              cardId={id}
              columnKey={column.key}
              data-test={`board-card-${id}`}
              key={id}
              moving={moving}
              onFocus={() => onFocusCard(id)}
              onMoveFocus={(direction) => onMoveFocus(id, direction)}
              ref={(element) => registerCardRef(id, element)}
              removeCard={removeCard}
              restoreCard={restoreCard}
              schema={cardSchema}
              tabIndex={focusedCardId === id ? 0 : -1}
            />
          );

          return placeholder?.index === index ? [dropPlaceholder(placeholder), item] : [item];
        })}
        {placeholder !== null && placeholder.index >= view.cards.length
          ? dropPlaceholder(placeholder)
          : null}
        {view.cards.length === 0 && !view.loading && placeholder === null ? (
          <li className="px-1 py-2 text-sm text-lt-muted-fg">
            {t("board.empty-column", "No cards")}
          </li>
        ) : null}
        {createAction ? (
          <li>
            <QuickAdd
              columnKey={column.key}
              createAction={createAction}
              onCreated={onResetColumn}
            />
          </li>
        ) : null}
      </ul>
      {view.hasMore ? (
        <button
          className="mt-2 rounded-lt-sm px-2 py-1.5 text-left text-sm text-lt-muted-fg hover:bg-lt-muted hover:text-lt-fg"
          disabled={view.loading}
          onClick={onLoadMore}
          type="button"
        >
          {t("board.load-more", "Load more")}
        </button>
      ) : null}
    </section>
  );
}
