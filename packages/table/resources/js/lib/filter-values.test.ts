import { describe, expect, it } from "vitest";
import type { FilterNode } from "@lattice-php/lattice/table/types";
import {
  filterOptions,
  isActiveFilterValue,
  isEmptyFilterValue,
  stringProp,
} from "./filter-values";

describe("isEmptyFilterValue", () => {
  it.each([
    ["null", null, true],
    ["empty string", "", true],
    ["empty array", [], true],
    ["all-empty object", { from: "", until: "" }, true],
    ["non-empty string", "x", false],
    ["non-empty array", ["a"], false],
    ["partial object", { from: "2026-01-01", until: "" }, false],
  ])("treats %s as empty=%s", (_label, value, expected) => {
    expect(isEmptyFilterValue(value)).toBe(expected);
    expect(isActiveFilterValue(value)).toBe(!expected);
  });
});

const filter: FilterNode<string> = {
  key: "status",
  type: "filter.select",
  props: { label: "Status", placeholder: "Pick", options: [{ label: "Active", value: "active" }] },
};

describe("stringProp", () => {
  it("returns the string prop when present", () => {
    expect(stringProp(filter, "placeholder", "fallback")).toBe("Pick");
  });

  it("falls back when the prop is absent or not a string", () => {
    expect(stringProp(filter, "missing", "fallback")).toBe("fallback");
    expect(
      stringProp(
        { ...filter, props: { label: "Status", placeholder: 3 } },
        "placeholder",
        "fallback",
      ),
    ).toBe("fallback");
  });
});

describe("filterOptions", () => {
  it("returns the options array", () => {
    expect(filterOptions(filter)).toEqual([{ label: "Active", value: "active" }]);
  });

  it("returns an empty array when options are absent", () => {
    expect(filterOptions({ ...filter, props: { label: null } })).toEqual([]);
  });
});
