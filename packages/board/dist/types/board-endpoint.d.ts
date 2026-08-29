export type BoardQueryState = {
  q: string;
  tf: Record<string, unknown>;
};
export declare function emptyBoardQuery(): BoardQueryState;
/**
 * Builds a board endpoint URL carrying the current search/filter state plus
 * any per-request params (column, offset, limit) — every board request
 * (initial reload, load-more, quick-add's column reset) goes through this so
 * `q`/`tf` stay attached as the user searches or filters.
 */
export declare function buildBoardEndpoint(
  endpoint: string,
  query: BoardQueryState,
  params?: Record<string, string>,
): string;
