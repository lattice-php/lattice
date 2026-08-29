import type { Node } from "@lattice-php/core";
import type { BoardColumnCards, BoardColumnData, BoardResult } from "./generated";

export type BoardCard = Record<string, unknown>;

export function getCardUrl(card: BoardCard): string | null {
  return typeof card.cardUrl === "string" ? card.cardUrl : null;
}

export function getCardActions(card: BoardCard): Node[] {
  return Array.isArray(card.actions) ? (card.actions as Node[]) : [];
}

export type BoardColumnMeta = {
  hasMore: boolean;
  loading: boolean;
  offset: number;
  total: number;
};

export type BoardStoreState = {
  cards: Map<string, BoardCard>;
  generation: number;
  meta: Map<string, BoardColumnMeta>;
  moving: boolean;
  order: Map<string, string[]>;
};

export type BoardMoveRequest = { cardId: string; columnKey: string; position: number };

export function cardKey(card: BoardCard): string {
  const id = card.id;

  return typeof id === "string" || typeof id === "number" ? String(id) : "";
}

function emptyMeta(): BoardColumnMeta {
  return { hasMore: false, loading: false, offset: 0, total: 0 };
}

export function createBoardState(columns: BoardColumnData[]): BoardStoreState {
  const meta = new Map<string, BoardColumnMeta>();
  const order = new Map<string, string[]>();

  for (const column of columns) {
    meta.set(column.key, emptyMeta());
    order.set(column.key, []);
  }

  return { cards: new Map(), generation: 0, meta, moving: false, order };
}

/**
 * A full-board reload: the initial `result` prop, a refetch after a
 * `reloadComponent` event, or a future search/filter change. Replaces every
 * column's cards, meta, and order wholesale and bumps `generation` so any
 * load-more request still in flight from before the reload is ignored when
 * it resolves.
 */
export function replaceAll(state: BoardStoreState, result: BoardResult): BoardStoreState {
  const cards = new Map<string, BoardCard>();
  const order = new Map<string, string[]>();
  const meta = new Map<string, BoardColumnMeta>();

  for (const column of result.columns) {
    const ids: string[] = [];

    for (const card of column.cards) {
      const key = cardKey(card);

      if (key === "") {
        continue;
      }

      cards.set(key, card);
      ids.push(key);
    }

    order.set(column.key, ids);
    meta.set(column.key, {
      hasMore: column.hasMore,
      loading: false,
      offset: ids.length,
      total: column.total,
    });
  }

  return { cards, generation: state.generation + 1, meta, moving: false, order };
}

/**
 * A load-more page for a single column. Cards are appended, deduped by id
 * against what the column already holds — an id already present has its data
 * refreshed in place but is not pushed into `order` a second time. Leaves
 * `generation` untouched: this is a partial update, not a reload.
 */
export function appendColumn(
  state: BoardStoreState,
  columnCards: BoardColumnCards,
): BoardStoreState {
  const cards = new Map(state.cards);
  const existingIds = state.order.get(columnCards.key) ?? [];
  const seen = new Set(existingIds);
  const appendedIds: string[] = [];

  for (const card of columnCards.cards) {
    const key = cardKey(card);

    if (key === "") {
      continue;
    }

    cards.set(key, card);

    if (!seen.has(key)) {
      seen.add(key);
      appendedIds.push(key);
    }
  }

  const ids = [...existingIds, ...appendedIds];
  const order = new Map(state.order);
  order.set(columnCards.key, ids);

  const meta = new Map(state.meta);
  meta.set(columnCards.key, {
    hasMore: columnCards.hasMore,
    loading: false,
    offset: ids.length,
    total: columnCards.total,
  });

  return { ...state, cards, meta, order };
}

/**
 * A single column's fresh first page, replacing its cards, order, and meta
 * wholesale — the quick-add follow-up refetch, so a card created out of
 * position order (or a stale local page) doesn't linger. Unlike `replaceAll`,
 * this touches only one column and leaves `generation` untouched: it is a
 * partial update, not a full board reload.
 */
export function replaceColumn(
  state: BoardStoreState,
  columnCards: BoardColumnCards,
): BoardStoreState {
  const cards = new Map(state.cards);
  const ids: string[] = [];

  for (const card of columnCards.cards) {
    const key = cardKey(card);

    if (key === "") {
      continue;
    }

    cards.set(key, card);
    ids.push(key);
  }

  const order = new Map(state.order);
  order.set(columnCards.key, ids);

  const meta = new Map(state.meta);
  meta.set(columnCards.key, {
    hasMore: columnCards.hasMore,
    loading: false,
    offset: ids.length,
    total: columnCards.total,
  });

  return { ...state, cards, meta, order };
}

export function setColumnLoading(
  state: BoardStoreState,
  columnKey: string,
  loading: boolean,
): BoardStoreState {
  const current = state.meta.get(columnKey);

  if (!current || current.loading === loading) {
    return state;
  }

  const meta = new Map(state.meta);
  meta.set(columnKey, { ...current, loading });

  return { ...state, meta };
}

export function cardsFor(state: BoardStoreState, columnKey: string): BoardCard[] {
  const ids = state.order.get(columnKey) ?? [];

  return ids
    .map((id) => state.cards.get(id))
    .filter((card): card is BoardCard => card !== undefined);
}

export type BoardCardLocation = { columnKey: string; index: number };

export function locateCard(state: BoardStoreState, cardId: string): BoardCardLocation | null {
  for (const [columnKey, ids] of state.order) {
    const index = ids.indexOf(cardId);

    if (index !== -1) {
      return { columnKey, index };
    }
  }

  return null;
}

/**
 * The optimistic mirror of the server's `BoardMovePlanner`: moves a card
 * within or across columns and adjusts both columns' totals and offsets,
 * without waiting for the move action's response. Returns null for a no-op
 * move (unknown card, unknown destination column, or a drop back at the
 * card's own position) so callers can skip the request entirely.
 */
export function optimisticMove(
  state: BoardStoreState,
  move: BoardMoveRequest,
): BoardStoreState | null {
  if (!state.cards.has(move.cardId) || !state.order.has(move.columnKey)) {
    return null;
  }

  const location = locateCard(state, move.cardId);

  if (location === null) {
    return null;
  }

  const sourceColumnKey = location.columnKey;
  const sameColumn = sourceColumnKey === move.columnKey;
  const sourceIds = state.order.get(sourceColumnKey) ?? [];
  const sourceIndex = location.index;
  const withoutCard = sourceIds.filter((id) => id !== move.cardId);
  const destinationIds = sameColumn ? withoutCard : [...(state.order.get(move.columnKey) ?? [])];
  const position = Math.max(0, Math.min(move.position, destinationIds.length));

  if (sameColumn && sourceIndex === position) {
    return null;
  }

  destinationIds.splice(position, 0, move.cardId);

  const order = new Map(state.order);
  order.set(sourceColumnKey, withoutCard);
  order.set(move.columnKey, destinationIds);

  const meta = new Map(state.meta);

  if (!sameColumn) {
    const sourceMeta = meta.get(sourceColumnKey);
    const destinationMeta = meta.get(move.columnKey);

    if (sourceMeta) {
      meta.set(sourceColumnKey, {
        ...sourceMeta,
        offset: Math.max(0, sourceMeta.offset - 1),
        total: Math.max(0, sourceMeta.total - 1),
      });
    }

    if (destinationMeta) {
      meta.set(move.columnKey, {
        ...destinationMeta,
        offset: destinationMeta.offset + 1,
        total: destinationMeta.total + 1,
      });
    }
  }

  return { ...state, meta, order };
}
