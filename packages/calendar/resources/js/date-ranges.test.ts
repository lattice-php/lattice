import { describe, expect, it } from "vitest";
import { mergeRanges, uncoveredGaps } from "./date-ranges";

describe("mergeRanges", () => {
  it("leaves disjoint ranges apart", () => {
    expect(
      mergeRanges([
        ["2026-01-01", "2026-01-05"],
        ["2026-02-01", "2026-02-05"],
      ]),
    ).toEqual([
      ["2026-01-01", "2026-01-05"],
      ["2026-02-01", "2026-02-05"],
    ]);
  });

  it("coalesces touching ranges into one", () => {
    expect(
      mergeRanges([
        ["2026-01-01", "2026-01-05"],
        ["2026-01-05", "2026-01-10"],
      ]),
    ).toEqual([["2026-01-01", "2026-01-10"]]);
  });

  it("coalesces overlapping and out-of-order ranges", () => {
    expect(
      mergeRanges([
        ["2026-01-03", "2026-01-06"],
        ["2026-01-01", "2026-01-10"],
      ]),
    ).toEqual([["2026-01-01", "2026-01-10"]]);
  });
});

describe("uncoveredGaps", () => {
  const d1 = "2026-01-01";
  const d2 = "2026-01-05";
  const d3 = "2026-01-10";
  const d4 = "2026-01-15";

  it("reports the whole query as a gap when disjoint from what's loaded", () => {
    expect(uncoveredGaps([[d1, d2]], d3, d4)).toEqual([[d3, d4]]);
  });

  it("reports the whole query as a gap when it only touches a loaded range", () => {
    expect(uncoveredGaps([[d1, d2]], d2, d3)).toEqual([[d2, d3]]);
  });

  it("reports no gap when the query is fully contained in a loaded range", () => {
    expect(uncoveredGaps([[d1, d4]], d2, d3)).toEqual([]);
  });

  it("reports only the gap between two loaded ranges spanning the query", () => {
    expect(
      uncoveredGaps(
        [
          [d1, d2],
          [d3, d4],
        ],
        d1,
        d4,
      ),
    ).toEqual([[d2, d3]]);
  });
});
