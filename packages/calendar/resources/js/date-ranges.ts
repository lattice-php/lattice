export type DateRange = readonly [string, string];

/** Sorts and coalesces overlapping or touching ranges into the fewest covering ranges. */
export function mergeRanges(ranges: readonly DateRange[]): DateRange[] {
  if (ranges.length === 0) {
    return [];
  }

  const sorted = [...ranges].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const merged: [string, string][] = [[sorted[0][0], sorted[0][1]]];

  for (const [from, to] of sorted.slice(1)) {
    const last = merged[merged.length - 1];

    if (from <= last[1]) {
      if (to > last[1]) {
        last[1] = to;
      }
    } else {
      merged.push([from, to]);
    }
  }

  return merged;
}

/**
 * The gap(s) within [from, to) not covered by `loadedRanges`. Each returned
 * gap is itself half-open, so a caller can request exactly the missing slice.
 */
export function uncoveredGaps(
  loadedRanges: readonly DateRange[],
  from: string,
  to: string,
): DateRange[] {
  if (from >= to) {
    return [];
  }

  const merged = mergeRanges(loadedRanges);
  const gaps: DateRange[] = [];
  let cursor = from;

  for (const [rangeFrom, rangeTo] of merged) {
    if (rangeTo <= cursor) {
      continue;
    }

    if (rangeFrom >= to) {
      break;
    }

    if (rangeFrom > cursor) {
      gaps.push([cursor, rangeFrom]);
    }

    cursor = rangeTo > cursor ? (rangeTo < to ? rangeTo : to) : cursor;

    if (cursor >= to) {
      break;
    }
  }

  if (cursor < to) {
    gaps.push([cursor, to]);
  }

  return gaps;
}
