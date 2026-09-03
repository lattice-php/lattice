import { describe, expect, it } from "vitest";
import { documentContent, isEmptyDocument, textDocument } from "./typing";

describe("typing helpers", () => {
  it("treats a missing document, no nodes, or one empty paragraph as empty", () => {
    expect(isEmptyDocument(null)).toBe(true);
    expect(isEmptyDocument({ content: [], type: "doc" })).toBe(true);
    expect(isEmptyDocument({ content: [{ type: "paragraph" }], type: "doc" })).toBe(true);
    expect(isEmptyDocument(textDocument("x"))).toBe(false);
    expect(
      isEmptyDocument({ content: [{ type: "paragraph" }, { type: "paragraph" }], type: "doc" }),
    ).toBe(false);
  });

  it("turns plain text into a one-paragraph document and nothing into null", () => {
    expect(textDocument("")).toBeNull();
    expect(textDocument("Hi")).toEqual({
      content: [{ content: [{ text: "Hi", type: "text" }], type: "paragraph" }],
      type: "doc",
    });
  });

  it("exposes the top-level nodes for merging and none for an empty document", () => {
    expect(documentContent(textDocument("Hi"))).toHaveLength(1);
    expect(documentContent(null)).toEqual([]);
  });
});
