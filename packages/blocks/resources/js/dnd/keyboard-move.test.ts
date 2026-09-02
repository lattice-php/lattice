import { describe, expect, it } from "vitest";
import { block, columnsType, document, testTypes, textOnlySectionType } from "../test-support";
import { keyboardMoveTarget } from "./keyboard-move";

const doc = document(
  block("h", "lattice.heading"),
  block(
    "c",
    columnsType.type,
    {},
    { col_1: [block("a", "lattice.paragraph"), block("b", "lattice.paragraph")], col_2: [] },
  ),
  block("s", textOnlySectionType.type, {}, { content: [block("t", "lattice.heading")] }),
);

describe("keyboardMoveTarget", () => {
  it("swaps with the neighbouring sibling", () => {
    expect(keyboardMoveTarget(doc, testTypes, "b", "up")).toEqual({
      index: 0,
      parentId: "c",
      slot: "col_1",
    });
    expect(keyboardMoveTarget(doc, testTypes, "a", "down")).toEqual({
      index: 2,
      parentId: "c",
      slot: "col_1",
    });
  });

  it("leaves a slot at its edge to land next to the parent", () => {
    expect(keyboardMoveTarget(doc, testTypes, "a", "up")).toEqual({
      index: 1,
      parentId: null,
      slot: null,
    });
    expect(keyboardMoveTarget(doc, testTypes, "b", "down")).toEqual({
      index: 2,
      parentId: null,
      slot: null,
    });
  });

  it("stops at the document edges", () => {
    expect(keyboardMoveTarget(doc, testTypes, "h", "up")).toBeNull();
    expect(keyboardMoveTarget(doc, testTypes, "s", "down")).toBeNull();
    expect(keyboardMoveTarget(doc, testTypes, "nope", "down")).toBeNull();
  });
});
