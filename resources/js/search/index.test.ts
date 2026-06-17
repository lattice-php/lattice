import { describe, expect, it } from "vitest";
import { searchComponents } from "./index";

describe("searchComponents", () => {
  it("registers every search wire type", () => {
    expect(Object.keys(searchComponents.components ?? {})).toEqual(
      expect.arrayContaining([
        "search.box",
        "search.input",
        "search.categories",
        "search.results",
        "search.recent",
        "search.preview",
      ]),
    );
  });
});
