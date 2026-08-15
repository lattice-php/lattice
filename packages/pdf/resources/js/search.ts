export type SearchMatch = {
  page: number;
  start: number;
  length: number;
};

type ItemRange = {
  item: number;
  start: number;
  end: number;
  current: boolean;
};

function itemStarts(items: string[]): number[] {
  const starts: number[] = [];
  let offset = 0;

  for (const item of items) {
    starts.push(offset);
    offset += item.length;
  }

  return starts;
}

export function findPageMatches(items: string[], page: number, query: string): SearchMatch[] {
  const needle = query.toLowerCase();

  if (needle === "") {
    return [];
  }

  const text = items.join("").toLowerCase();
  const matches: SearchMatch[] = [];
  let from = 0;

  while (true) {
    const start = text.indexOf(needle, from);

    if (start === -1) {
      return matches;
    }

    matches.push({ page, start, length: needle.length });
    from = start + needle.length;
  }
}

function rangesByItem(
  items: string[],
  matches: SearchMatch[],
  currentStart: number | null,
): Map<number, ItemRange[]> {
  const starts = itemStarts(items);
  const ranges = new Map<number, ItemRange[]>();

  for (const match of matches) {
    const matchEnd = match.start + match.length;

    for (let item = 0; item < items.length; item += 1) {
      const itemStart = starts[item]!;
      const itemEnd = itemStart + items[item]!.length;

      if (itemEnd <= match.start || itemStart >= matchEnd) {
        continue;
      }

      const list = ranges.get(item) ?? [];
      list.push({
        item,
        start: Math.max(match.start, itemStart) - itemStart,
        end: Math.min(matchEnd, itemEnd) - itemStart,
        current: match.start === currentStart,
      });
      ranges.set(item, list);
    }
  }

  return ranges;
}

/**
 * Builds DOM ranges over the untouched text-layer divs for the CSS Custom
 * Highlight API — the browser then paints matches like a native selection,
 * without mutating the text layer.
 */
export function matchRanges(options: {
  textDivs: HTMLElement[];
  items: string[];
  matches: SearchMatch[];
  currentStart: number | null;
}): { all: Range[]; current: Range[] } {
  const ranges = rangesByItem(options.items, options.matches, options.currentStart);
  const all: Range[] = [];
  const current: Range[] = [];

  for (const [item, itemRanges] of ranges) {
    const textNode = options.textDivs[item]?.firstChild;

    if (!(textNode instanceof Text)) {
      continue;
    }

    for (const itemRange of itemRanges) {
      if (itemRange.end > textNode.length) {
        continue;
      }

      const range = textNode.ownerDocument.createRange();
      range.setStart(textNode, itemRange.start);
      range.setEnd(textNode, itemRange.end);
      all.push(range);

      if (itemRange.current) {
        current.push(range);
      }
    }
  }

  return { all, current };
}

/**
 * Fallback for browsers without the CSS Custom Highlight API: rebuilds each
 * text-layer div's children so match ranges render as <mark> elements. Divs
 * are keyed by text-content item; resetting to the plain item string first
 * keeps the operation idempotent across query changes.
 */
export function applyHighlights(options: {
  textDivs: HTMLElement[];
  items: string[];
  matches: SearchMatch[];
  currentStart: number | null;
}): void {
  const { textDivs, items, matches, currentStart } = options;
  const ranges = rangesByItem(items, matches, currentStart);

  for (let item = 0; item < textDivs.length; item += 1) {
    const div = textDivs[item]!;
    const text = items[item] ?? "";
    const itemRanges = ranges.get(item);

    if (!itemRanges) {
      if (div.querySelector("mark")) {
        div.textContent = text;
      }

      continue;
    }

    itemRanges.sort((a, b) => a.start - b.start);
    div.textContent = "";
    let cursor = 0;

    for (const range of itemRanges) {
      if (range.start > cursor) {
        div.append(text.slice(cursor, range.start));
      }

      const mark = div.ownerDocument.createElement("mark");
      mark.className = range.current ? "lt-pdf-match lt-pdf-match--current" : "lt-pdf-match";
      mark.textContent = text.slice(range.start, range.end);
      div.append(mark);
      cursor = range.end;
    }

    if (cursor < text.length) {
      div.append(text.slice(cursor));
    }
  }
}
