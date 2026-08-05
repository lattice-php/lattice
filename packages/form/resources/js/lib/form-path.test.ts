import { describe, expect, it } from "vitest";
import { appendPath, getPath, setPath, toHtmlName } from "./form-path";

describe("form paths", () => {
  it("converts dot paths to bracketed HTML names", () => {
    expect(toHtmlName("items.0.children.1.name")).toBe("items[0][children][1][name]");
  });

  it("appends local names to parent paths", () => {
    expect(appendPath(null, "items")).toBe("items");
    expect(appendPath("items.0", "children")).toBe("items.0.children");
  });

  it("reads and writes nested values immutably", () => {
    const values = { items: [{ children: [{ name: "A" }] }] };
    const next = setPath(values, "items.0.children.0.name", "B");

    expect(getPath(next, "items.0.children.0.name")).toBe("B");
    expect(getPath(values, "items.0.children.0.name")).toBe("A");
  });

  it("returns undefined when traversal hits a null along the path", () => {
    expect(getPath({ a: null }, "a.b.c")).toBeUndefined();
  });

  it("returns an empty html name for a blank path", () => {
    expect(toHtmlName("")).toBe("");
  });

  it("returns the values untouched when the path is empty", () => {
    const values = { a: 1 };

    expect(setPath(values, "", 2)).toBe(values);
  });

  it("builds fresh containers, using an array when the next segment is numeric", () => {
    const withArray = setPath({}, "a.b.0", "A");
    const withObject = setPath({}, "meta.title", "B");

    expect(getPath(withArray, "a.b.0")).toBe("A");
    expect(Array.isArray((withArray as { a: unknown }).a)).toBe(true);
    expect(getPath(withObject, "meta.title")).toBe("B");
    expect(Array.isArray((withObject as { meta: unknown }).meta)).toBe(false);
  });
});
