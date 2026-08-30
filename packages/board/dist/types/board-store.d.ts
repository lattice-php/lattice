import { Node } from '@lattice-php/core';
import { BoardColumnCards, BoardColumnData, BoardResult } from './generated';
export type BoardCard = Record<string, unknown>;
export declare function getCardUrl(card: BoardCard): string | null;
export declare function getCardActions(card: BoardCard): Node[];
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
export type BoardMoveRequest = {
    cardId: string;
    columnKey: string;
    position: number;
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
export declare function appendColumn(state: BoardStoreState, columnCards: BoardColumnCards): BoardStoreState;
/**
 * A single column's fresh first page, replacing its cards, order, and meta
 * wholesale — the quick-add follow-up refetch, so a card created out of
 * position order (or a stale local page) doesn't linger. Unlike `replaceAll`,
 * this touches only one column and leaves `generation` untouched: it is a
 * partial update, not a full board reload.
 */
export declare function replaceColumn(state: BoardStoreState, columnCards: BoardColumnCards): BoardStoreState;
export declare function setColumnLoading(state: BoardStoreState, columnKey: string, loading: boolean): BoardStoreState;
export declare function cardsFor(state: BoardStoreState, columnKey: string): BoardCard[];
export type BoardCardLocation = {
    columnKey: string;
    index: number;
};
export declare function locateCard(state: BoardStoreState, cardId: string): BoardCardLocation | null;
export type BoardCardSnapshot = {
    card: BoardCard;
    cardId: string;
    columnKey: string;
    index: number;
};
/**
 * Drops a card from its column, adjusting that column's offset/total to
 * match — the optimistic mirror of the server-side delete the card's action
 * is expected to perform. A no-op (returns `state` unchanged) for an unknown
 * card id.
 */
export declare function removeCard(state: BoardStoreState, cardId: string): BoardStoreState;
/**
 * Re-inserts a card previously dropped by `removeCard`, at its recorded
 * column and index, restoring that column's offset/total — the rollback for
 * a failed optimistic delete. A no-op for an unknown column or a card id
 * that is already present (the snapshot is stale).
 */
export declare function restoreCard(state: BoardStoreState, snapshot: BoardCardSnapshot): BoardStoreState;
/**
 * The optimistic mirror of the server's `BoardMovePlanner`: moves a card
 * within or across columns and adjusts both columns' totals and offsets,
 * without waiting for the move action's response. Returns null for a no-op
 * move (unknown card, unknown destination column, or a drop back at the
 * card's own position) so callers can skip the request entirely.
 */
export declare function optimisticMove(state: BoardStoreState, move: BoardMoveRequest): BoardStoreState | null;
