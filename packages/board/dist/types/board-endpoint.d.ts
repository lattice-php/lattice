import { Board } from './generated';
export type BoardQueryState = Board["query"];
export declare function emptyBoardQuery(): BoardQueryState;
/**
 * The params a URL-synced board writes back: `q` and `tf`, omitted when
 * empty so a clean URL round-trips to a no-op write.
 */
export declare function getBoardUrlQueryParams(query: BoardQueryState): Record<string, unknown>;
/**
 * Builds a board endpoint URL carrying the current search/filter state plus
 * any per-request params (column, offset, limit) — every board request
 * (initial reload, load-more, quick-add's column reset) goes through this so
 * `q`/`tf` stay attached as the user searches or filters.
 */
export declare function buildBoardEndpoint(endpoint: string, query: BoardQueryState, params?: Record<string, string>): string;
