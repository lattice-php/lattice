import { Edge, Input } from "@lattice-php/lattice/dnd";
export declare const BOARD_CARD_DRAG_TYPE = "lattice-board-card";
export declare const BOARD_COLUMN_DRAG_TYPE = "lattice-board-column";
export type BoardDragSource = {
  columnKey: string;
  id: string;
};
export type BoardDropIntent = {
  cardId: string;
  columnKey: string;
  position: number;
};
export type BoardDropTarget =
  | {
      cardId: string;
      columnKey: string;
      edge: Edge | null;
      type: "card";
    }
  | {
      columnKey: string;
      type: "column";
    };
/** The drag payload every board card carries. */
export declare function boardCardDragData(source: BoardDragSource): Record<string, unknown>;
export declare function boardDragSource(
  data: Record<string | symbol, unknown>,
): BoardDragSource | null;
/** A card's own drop target: the top/bottom edge hitbox used to reorder next to it. */
export declare function boardCardDropTargetData(
  target: {
    cardId: string;
    columnKey: string;
  },
  args: {
    element: Element;
    input: Input;
  },
): Record<string, unknown>;
/** A column's card list as a drop target: dropping in its empty space appends at the end. */
export declare function boardColumnDropTargetData(columnKey: string): Record<string, unknown>;
/**
 * The nearest board-relevant target in a drop location, innermost first —
 * pragmatic-drag-and-drop lists a card's own drop target before the column
 * list wrapping it, so this returns the card when the drop landed on one.
 */
export declare function boardDropTarget(
  dropTargets: readonly {
    data: Record<string | symbol, unknown>;
  }[],
): BoardDropTarget | null;
/**
 * Pure drop-intent arithmetic: given the dragged card, where it landed, and
 * every column's current card order, decides the `{cardId, columnKey,
 * position}` the move action should carry. `order` must map every column key
 * to its full, current card-id order, source column included. Returns null
 * when the target is unrecognized or the drop cannot be resolved to a card.
 */
export declare function computeBoardDropIntent(
  source: BoardDragSource,
  target: BoardDropTarget,
  order: Map<string, string[]>,
): BoardDropIntent | null;
