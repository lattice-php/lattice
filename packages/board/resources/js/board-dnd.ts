import {
  attachClosestEdge,
  extractClosestEdge,
  getReorderDestinationIndex,
} from "@lattice-php/lattice/dnd";
import type { Edge, Input } from "@lattice-php/lattice/dnd";

export const BOARD_CARD_DRAG_TYPE = "lattice-board-card";
export const BOARD_COLUMN_DRAG_TYPE = "lattice-board-column";

export type BoardDragSource = { columnKey: string; id: string };

export type BoardDropIntent = { cardId: string; columnKey: string; position: number };

export type BoardDropTarget =
  | { cardId: string; columnKey: string; edge: Edge | null; type: "card" }
  | { columnKey: string; type: "column" };

/** The drag payload every board card carries. */
export function boardCardDragData(source: BoardDragSource): Record<string, unknown> {
  return { cardId: source.id, columnKey: source.columnKey, type: BOARD_CARD_DRAG_TYPE };
}

export function boardDragSource(data: Record<string | symbol, unknown>): BoardDragSource | null {
  if (
    data.type !== BOARD_CARD_DRAG_TYPE ||
    typeof data.cardId !== "string" ||
    typeof data.columnKey !== "string"
  ) {
    return null;
  }

  return { columnKey: data.columnKey, id: data.cardId };
}

/** A card's own drop target: the top/bottom edge hitbox used to reorder next to it. */
export function boardCardDropTargetData(
  target: { cardId: string; columnKey: string },
  args: { element: Element; input: Input },
): Record<string, unknown> {
  return attachClosestEdge(
    { cardId: target.cardId, columnKey: target.columnKey, type: BOARD_CARD_DRAG_TYPE },
    { ...args, allowedEdges: ["top", "bottom"] },
  );
}

/** A column's card list as a drop target: dropping in its empty space appends at the end. */
export function boardColumnDropTargetData(columnKey: string): Record<string, unknown> {
  return { columnKey, type: BOARD_COLUMN_DRAG_TYPE };
}

/**
 * The nearest board-relevant target in a drop location, innermost first —
 * pragmatic-drag-and-drop lists a card's own drop target before the column
 * list wrapping it, so this returns the card when the drop landed on one.
 */
export function boardDropTarget(
  dropTargets: readonly { data: Record<string | symbol, unknown> }[],
): BoardDropTarget | null {
  for (const target of dropTargets) {
    const data = target.data;

    if (
      data.type === BOARD_CARD_DRAG_TYPE &&
      typeof data.cardId === "string" &&
      typeof data.columnKey === "string"
    ) {
      return {
        cardId: data.cardId,
        columnKey: data.columnKey,
        edge: extractClosestEdge(data),
        type: "card",
      };
    }

    if (data.type === BOARD_COLUMN_DRAG_TYPE && typeof data.columnKey === "string") {
      return { columnKey: data.columnKey, type: "column" };
    }
  }

  return null;
}

/**
 * Pure drop-intent arithmetic: given the dragged card, where it landed, and
 * every column's current card order, decides the `{cardId, columnKey,
 * position}` the move action should carry. `order` must map every column key
 * to its full, current card-id order, source column included. Returns null
 * when the target is unrecognized or the drop cannot be resolved to a card.
 */
export function computeBoardDropIntent(
  source: BoardDragSource,
  target: BoardDropTarget,
  order: Map<string, string[]>,
): BoardDropIntent | null {
  if (target.type === "column") {
    const destination = order.get(target.columnKey);

    if (!destination) {
      return null;
    }

    const sameColumn = target.columnKey === source.columnKey;
    const position = sameColumn ? destination.length - 1 : destination.length;

    return { cardId: source.id, columnKey: target.columnKey, position: Math.max(0, position) };
  }

  if (target.cardId === source.id) {
    return null;
  }

  const edge = target.edge ?? "bottom";

  if (target.columnKey === source.columnKey) {
    const sourceOrder = order.get(source.columnKey);

    if (!sourceOrder) {
      return null;
    }

    const startIndex = sourceOrder.indexOf(source.id);
    const indexOfTarget = sourceOrder.indexOf(target.cardId);

    if (startIndex === -1 || indexOfTarget === -1) {
      return null;
    }

    const position = getReorderDestinationIndex({
      axis: "vertical",
      closestEdgeOfTarget: edge,
      indexOfTarget,
      startIndex,
    });

    return { cardId: source.id, columnKey: target.columnKey, position };
  }

  const destinationOrder = order.get(target.columnKey);

  if (!destinationOrder) {
    return null;
  }

  const indexOfTarget = destinationOrder.indexOf(target.cardId);

  if (indexOfTarget === -1) {
    return null;
  }

  const position = edge === "bottom" ? indexOfTarget + 1 : indexOfTarget;

  return { cardId: source.id, columnKey: target.columnKey, position };
}
