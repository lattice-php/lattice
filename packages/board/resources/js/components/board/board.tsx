import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Schema } from "@lattice-php/core";
import { announce, monitorForElements } from "@lattice-php/lattice/dnd";
import { useT } from "@lattice-php/ui/i18n";
import type { Board as BoardWireProps, BoardColumnData, BoardResult } from "../../generated";
import { useBoardState, type BoardColumnView } from "../../use-board-state";
import { boardDragSource, boardDropTarget, computeBoardDropIntent } from "../../board-dnd";
import { cardKey } from "../../board-store";
import {
  focusTargetForDirection,
  useCardFocusRegistry,
  type BoardFocusDirection,
} from "../../board-keyboard";
import { BoardColumn } from "./board-column";

export type BoardProps = {
  cardAction: BoardWireProps["cardAction"];
  columns: BoardColumnData[];
  componentRef: string | null;
  createAction: BoardWireProps["createAction"];
  "data-test"?: string;
  endpoint: string | null;
  identity?: string;
  moveAction: BoardWireProps["moveAction"];
  perColumn: number;
  result: BoardResult | null;
  schema: Schema;
};

function firstCardId(
  columnKeys: string[],
  columnsView: Map<string, BoardColumnView>,
): string | null {
  for (const key of columnKeys) {
    const card = columnsView.get(key)?.cards[0];

    if (card) {
      return cardKey(card);
    }
  }

  return null;
}

export function Board({
  cardAction,
  columns,
  componentRef,
  createAction,
  "data-test": testId,
  endpoint,
  identity,
  moveAction,
  perColumn,
  result,
  schema,
}: BoardProps) {
  const { canMove, columnKeys, columnsView, loadMore, move, moving, resetColumn } = useBoardState({
    columns,
    componentRef,
    endpoint,
    identity,
    moveAction,
    perColumn,
    result,
  });
  const { t } = useT("board");
  const { focusCard, registerCard } = useCardFocusRegistry();
  const [focusedCardId, setFocusedCardId] = useState<string | null>(() =>
    firstCardId(columnKeys, columnsView),
  );

  const cardsByColumn = useMemo(() => {
    const map = new Map<string, string[]>();

    for (const key of columnKeys) {
      map.set(
        key,
        (columnsView.get(key)?.cards ?? []).map((card) => cardKey(card)),
      );
    }

    return map;
  }, [columnKeys, columnsView]);

  const orderRef = useRef(cardsByColumn);
  orderRef.current = cardsByColumn;

  useEffect(() => {
    if (!canMove) {
      return;
    }

    return monitorForElements({
      canMonitor: ({ source }) => boardDragSource(source.data) !== null,
      onDrop: ({ location, source }) => {
        const dragSource = boardDragSource(source.data);
        const target = boardDropTarget(location.current.dropTargets);

        if (!dragSource || !target) {
          return;
        }

        const intent = computeBoardDropIntent(dragSource, target, orderRef.current);

        if (!intent) {
          return;
        }

        void move(intent).then((accepted) => {
          announce(
            accepted
              ? t("board.moved", "Card moved")
              : t("board.move-failed", "Could not move card"),
          );
        });
      },
    });
  }, [canMove, move, t]);

  useEffect(() => {
    if (
      focusedCardId !== null &&
      [...cardsByColumn.values()].some((ids) => ids.includes(focusedCardId))
    ) {
      return;
    }

    setFocusedCardId(firstCardId(columnKeys, columnsView));
  }, [cardsByColumn, columnKeys, columnsView, focusedCardId]);

  const moveFocus = useCallback(
    (columnKey: string, cardId: string, direction: BoardFocusDirection) => {
      const target = focusTargetForDirection(
        columnKeys,
        cardsByColumn,
        columnKey,
        cardId,
        direction,
      );

      if (target) {
        setFocusedCardId(target.cardId);
        focusCard(target.cardId);
      }
    },
    [cardsByColumn, columnKeys, focusCard],
  );

  return (
    <div className="lt-board" data-test={testId}>
      {columns.map((column) => (
        <BoardColumn
          canMove={canMove}
          cardAction={cardAction}
          cardSchema={schema}
          column={column}
          createAction={createAction}
          focusedCardId={focusedCardId}
          key={column.key}
          moving={moving}
          onFocusCard={setFocusedCardId}
          onLoadMore={() => loadMore(column.key)}
          onMoveFocus={(cardId, direction) => moveFocus(column.key, cardId, direction)}
          onResetColumn={() => resetColumn(column.key)}
          registerCardRef={registerCard}
          view={
            columnsView.get(column.key) ?? { cards: [], hasMore: false, loading: false, total: 0 }
          }
        />
      ))}
    </div>
  );
}
