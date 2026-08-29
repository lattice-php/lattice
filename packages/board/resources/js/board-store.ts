import type { BoardColumnCards, BoardColumnData, BoardResult } from "./generated";

export type BoardCard = Record<string, unknown>;

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
  order: Map<string, string[]>;
};

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

  return { cards: new Map(), generation: 0, meta, order };
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

  return { cards, generation: state.generation + 1, meta, order };
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
