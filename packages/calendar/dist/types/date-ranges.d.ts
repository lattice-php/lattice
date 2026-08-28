export type DateRange = readonly [string, string];
/** Sorts and coalesces overlapping or touching ranges into the fewest covering ranges. */
export declare function mergeRanges(ranges: readonly DateRange[]): DateRange[];
/**
 * The gap(s) within [from, to) not covered by `loadedRanges`. Each returned
 * gap is itself half-open, so a caller can request exactly the missing slice.
 */
export declare function uncoveredGaps(loadedRanges: readonly DateRange[], from: string, to: string): DateRange[];
