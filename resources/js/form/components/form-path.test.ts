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
});
