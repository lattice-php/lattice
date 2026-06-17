import { describe, expect, it } from "vitest";
import { globalSearchPlugin } from "./index";

describe("globalSearchPlugin", () => {
  it("registers every global-search wire type", () => {
    expect(Object.keys(globalSearchPlugin.components ?? {})).toEqual(
      expect.arrayContaining([
        "global-search",
        "global-search.input",
        "global-search.categories",
        "global-search.results",
        "global-search.recent",
        "global-search.preview",
      ]),
    );
  });
});
