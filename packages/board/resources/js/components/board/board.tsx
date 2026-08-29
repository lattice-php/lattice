import { useCallback, useEffect, useMemo, useState } from "react";
import type { Schema } from "@lattice-php/core";
import type { BoardColumnData, BoardResult } from "../../generated";
import { useBoardState, type BoardColumnView } from "../../use-board-state";
import { cardKey } from "../../board-store";
import {
  focusTargetForDirection,
  useCardFocusRegistry,
  type BoardFocusDirection,
} from "../../board-keyboard";
import { BoardColumn } from "./board-column";

export type BoardProps = {
  columns: BoardColumnData[];
  componentRef: string | null;
  "data-test"?: string;
  endpoint: string | null;
  identity?: string;
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
  columns,
  componentRef,
  "data-test": testId,
  endpoint,
  identity,
  perColumn,
  result,
  schema,
}: BoardProps) {
  const { columnKeys, columnsView, loadMore } = useBoardState({
    columns,
    componentRef,
    endpoint,
    identity,
    perColumn,
    result,
  });
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
          cardSchema={schema}
          column={column}
          focusedCardId={focusedCardId}
          key={column.key}
          onFocusCard={setFocusedCardId}
          onLoadMore={() => loadMore(column.key)}
          onMoveFocus={(cardId, direction) => moveFocus(column.key, cardId, direction)}
          registerCardRef={registerCard}
          view={
            columnsView.get(column.key) ?? { cards: [], hasMore: false, loading: false, total: 0 }
          }
        />
      ))}
    </div>
  );
}
