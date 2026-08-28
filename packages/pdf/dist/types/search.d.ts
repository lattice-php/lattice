export type SearchMatch = {
  page: number;
  start: number;
  length: number;
};
export declare function findPageMatches(
  items: string[],
  page: number,
  query: string,
): SearchMatch[];
/**
 * Builds DOM ranges over the untouched text-layer divs for the CSS Custom
 * Highlight API — the browser then paints matches like a native selection,
 * without mutating the text layer.
 */
export declare function matchRanges(options: {
  textDivs: HTMLElement[];
  items: string[];
  matches: SearchMatch[];
  currentStart: number | null;
}): {
  all: Range[];
  current: Range[];
};
/**
 * Fallback for browsers without the CSS Custom Highlight API: rebuilds each
 * text-layer div's children so match ranges render as <mark> elements. Divs
 * are keyed by text-content item; resetting to the plain item string first
 * keeps the operation idempotent across query changes.
 */
export declare function applyHighlights(options: {
  textDivs: HTMLElement[];
  items: string[];
  matches: SearchMatch[];
  currentStart: number | null;
}): void;
