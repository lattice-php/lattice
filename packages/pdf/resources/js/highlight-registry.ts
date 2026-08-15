export const MATCH_HIGHLIGHT = "lt-pdf-match";
export const CURRENT_MATCH_HIGHLIGHT = "lt-pdf-match-current";

export type HighlightRanges = {
  all: Range[];
  current: Range[];
};

const owners = new Map<object, HighlightRanges>();

export function supportsHighlightApi(): boolean {
  return typeof CSS !== "undefined" && "highlights" in CSS;
}

/**
 * CSS.highlights holds one document-global Highlight per name, so every page
 * (and viewer instance) contributes its ranges to a shared registry that is
 * merged into the two named highlights on each change.
 */
export function setHighlightRanges(owner: object, ranges: HighlightRanges): void {
  owners.set(owner, ranges);
  sync();
}

export function clearHighlightRanges(owner: object): void {
  if (owners.delete(owner)) {
    sync();
  }
}

function sync(): void {
  const all: Range[] = [];
  const current: Range[] = [];

  for (const ranges of owners.values()) {
    all.push(...ranges.all);
    current.push(...ranges.current);
  }

  CSS.highlights.set(MATCH_HIGHLIGHT, new Highlight(...all));
  CSS.highlights.set(CURRENT_MATCH_HIGHLIGHT, new Highlight(...current));
}
