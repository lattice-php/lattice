import { describe, expect, it } from "vitest";
import { applyHighlights, findPageMatches } from "./search";

describe("findPageMatches", () => {
  it("matches case-insensitively with offsets into the concatenated page text", () => {
    const items = ["The Quick brown fox. ", "A quick check."];

    const matches = findPageMatches(items, 3, "quick");

    expect(matches).toEqual([
      { page: 3, start: 4, length: 5 },
      { page: 3, start: 23, length: 5 },
    ]);
  });

  it("finds matches spanning an item boundary", () => {
    const matches = findPageMatches(["Latt", "ice viewer"], 1, "lattice");

    expect(matches).toEqual([{ page: 1, start: 0, length: 7 }]);
  });

  it("returns nothing for empty queries", () => {
    expect(findPageMatches(["content"], 1, "")).toEqual([]);
  });
});

describe("applyHighlights", () => {
  function layerFor(items: string[]): HTMLElement[] {
    return items.map((item) => {
      const div = document.createElement("div");
      div.textContent = item;

      return div;
    });
  }

  it("wraps match ranges in mark elements and flags the current match", () => {
    const items = ["The quick brown fox. ", "A quick check."];
    const textDivs = layerFor(items);
    const matches = findPageMatches(items, 1, "quick");

    applyHighlights({ textDivs, items, matches, currentStart: 23 });

    const [first, second] = textDivs;
    expect(first!.querySelector("mark")!.textContent).toBe("quick");
    expect(first!.querySelector("mark.lt-pdf-match--current")).toBeNull();
    expect(second!.querySelector("mark.lt-pdf-match--current")!.textContent).toBe("quick");
    expect(first!.textContent).toBe(items[0]);
    expect(second!.textContent).toBe(items[1]);
  });

  it("splits a boundary-spanning match across the affected divs", () => {
    const items = ["Latt", "ice viewer"];
    const textDivs = layerFor(items);

    applyHighlights({
      textDivs,
      items,
      matches: findPageMatches(items, 1, "lattice"),
      currentStart: null,
    });

    expect(textDivs[0]!.querySelector("mark")!.textContent).toBe("Latt");
    expect(textDivs[1]!.querySelector("mark")!.textContent).toBe("ice");
    expect(textDivs[1]!.textContent).toBe("ice viewer");
  });

  it("clears previous marks when a new query has no matches in a div", () => {
    const items = ["The quick brown fox. "];
    const textDivs = layerFor(items);

    applyHighlights({
      textDivs,
      items,
      matches: findPageMatches(items, 1, "quick"),
      currentStart: null,
    });
    expect(textDivs[0]!.querySelector("mark")).not.toBeNull();

    applyHighlights({ textDivs, items, matches: [], currentStart: null });

    expect(textDivs[0]!.querySelector("mark")).toBeNull();
    expect(textDivs[0]!.textContent).toBe(items[0]);
  });
});
