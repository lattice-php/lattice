import { useCallback, useRef } from "react";

export type BoardFocusDirection = "left" | "next" | "prev" | "right";

export const BOARD_FOCUS_KEYS: Record<string, BoardFocusDirection> = {
  ArrowDown: "next",
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "prev",
};

export type BoardFocusTarget = {
  cardId: string;
  columnKey: string;
};

/**
 * Pure roving-focus arithmetic: `next`/`prev` move within the current
 * column's card order; `left`/`right` step to the neighbouring column,
 * skipping empty ones, landing on the card at the same row index (clamped)
 * so a vertical move stays roughly aligned.
 */
export function focusTargetForDirection(
  columnKeys: string[],
  cardsByColumn: Map<string, string[]>,
  columnKey: string,
  cardId: string,
  direction: BoardFocusDirection,
): BoardFocusTarget | null {
  const cardsInColumn = cardsByColumn.get(columnKey) ?? [];
  const index = cardsInColumn.indexOf(cardId);

  if (direction === "next" || direction === "prev") {
    if (index === -1) {
      return null;
    }

    const targetIndex = direction === "next" ? index + 1 : index - 1;
    const targetId = cardsInColumn[targetIndex];

    return targetId ? { cardId: targetId, columnKey } : null;
  }

  const columnIndex = columnKeys.indexOf(columnKey);

  if (columnIndex === -1) {
    return null;
  }

  const step = direction === "right" ? 1 : -1;

  for (
    let candidateIndex = columnIndex + step;
    candidateIndex >= 0 && candidateIndex < columnKeys.length;
    candidateIndex += step
  ) {
    const candidateColumn = columnKeys[candidateIndex];
    const candidateCards = cardsByColumn.get(candidateColumn) ?? [];

    if (candidateCards.length === 0) {
      continue;
    }

    const row = index === -1 ? 0 : Math.min(index, candidateCards.length - 1);

    return { cardId: candidateCards[row], columnKey: candidateColumn };
  }

  return null;
}

/**
 * Imperative DOM registry for the currently rendered card elements, so
 * roving focus can call `.focus()` on the target after a keyboard move
 * without threading refs through every intermediate component.
 */
export function useCardFocusRegistry() {
  const elements = useRef(new Map<string, HTMLLIElement>());

  const registerCard = useCallback((id: string, element: HTMLLIElement | null) => {
    if (element) {
      elements.current.set(id, element);
    } else {
      elements.current.delete(id);
    }
  }, []);

  const focusCard = useCallback((id: string) => {
    elements.current.get(id)?.focus();
  }, []);

  return { focusCard, registerCard };
}
