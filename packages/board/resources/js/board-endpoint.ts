import { appendTableFilters } from "@lattice-php/table";

export type BoardQueryState = {
  q: string;
  tf: Record<string, unknown>;
};

export function emptyBoardQuery(): BoardQueryState {
  return { q: "", tf: {} };
}

/**
 * Builds a board endpoint URL carrying the current search/filter state plus
 * any per-request params (column, offset, limit) — every board request
 * (initial reload, load-more, quick-add's column reset) goes through this so
 * `q`/`tf` stay attached as the user searches or filters.
 */
export function buildBoardEndpoint(
  endpoint: string,
  query: BoardQueryState,
  params: Record<string, string> = {},
): string {
  const url = new URL(endpoint, window.location.origin);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  if (query.q !== "") {
    url.searchParams.set("q", query.q);
  }

  appendTableFilters(url, query.tf);

  return `${url.pathname}${url.search}`;
}
