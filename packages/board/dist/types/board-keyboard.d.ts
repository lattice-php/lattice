export type BoardFocusDirection = "left" | "next" | "prev" | "right";
export declare const BOARD_FOCUS_KEYS: Record<string, BoardFocusDirection>;
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
export declare function focusTargetForDirection(columnKeys: string[], cardsByColumn: Map<string, string[]>, columnKey: string, cardId: string, direction: BoardFocusDirection): BoardFocusTarget | null;
/**
 * Imperative DOM registry for the currently rendered card elements, so
 * roving focus can call `.focus()` on the target after a keyboard move
 * without threading refs through every intermediate component.
 */
export declare function useCardFocusRegistry(): {
    focusCard: (id: string) => void;
    registerCard: (id: string, element: HTMLLIElement | null) => void;
};
