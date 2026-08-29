import { BoardColumnCards, BoardColumnData, BoardResult } from "./generated";
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
export declare function cardKey(card: BoardCard): string;
export declare function createBoardState(columns: BoardColumnData[]): BoardStoreState;
/**
 * A full-board reload: the initial `result` prop, a refetch after a
 * `reloadComponent` event, or a future search/filter change. Replaces every
 * column's cards, meta, and order wholesale and bumps `generation` so any
 * load-more request still in flight from before the reload is ignored when
 * it resolves.
 */
export declare function replaceAll(state: BoardStoreState, result: BoardResult): BoardStoreState;
/**
 * A load-more page for a single column. Cards are appended, deduped by id
 * against what the column already holds — an id already present has its data
 * refreshed in place but is not pushed into `order` a second time. Leaves
 * `generation` untouched: this is a partial update, not a reload.
 */
export declare function appendColumn(
  state: BoardStoreState,
  columnCards: BoardColumnCards,
): BoardStoreState;
export declare function setColumnLoading(
  state: BoardStoreState,
  columnKey: string,
  loading: boolean,
): BoardStoreState;
export declare function cardsFor(state: BoardStoreState, columnKey: string): BoardCard[];
