import { describe, expect, it } from "vitest";
import { block, columnsType, document, testTypes, textOnlySectionType } from "../test-support";
import { allowedTypesFor, canPlace } from "./rules";

const doc = document(
  block("s", textOnlySectionType.type, {}, { content: [] }),
  block(
    "c",
    columnsType.type,
    {},
    { col_2: [block("a", "lattice.paragraph"), block("b", "lattice.paragraph")] },
  ),
);

describe("canPlace", () => {
  it("accepts anything at the root and enforces slot allow-lists", () => {
    expect(
      canPlace({
        blockType: "lattice.heading",
        document: doc,
        parentId: null,
        slot: null,
        types: testTypes,
      }),
    ).toBe(true);
    expect(
      canPlace({
        blockType: "lattice.heading",
        document: doc,
        parentId: "s",
        slot: "content",
        types: testTypes,
      }),
    ).toBe(false);
    expect(
      canPlace({
        blockType: "lattice.paragraph",
        document: doc,
        parentId: "s",
        slot: "content",
        types: testTypes,
      }),
    ).toBe(true);
  });

  it("enforces max but lets a block already inside the slot stay", () => {
    expect(
      canPlace({
        blockType: "lattice.paragraph",
        document: doc,
        parentId: "c",
        slot: "col_2",
        types: testTypes,
      }),
    ).toBe(false);
    expect(
      canPlace({
        blockType: "lattice.paragraph",
        document: doc,
        movingId: "a",
        parentId: "c",
        slot: "col_2",
        types: testTypes,
      }),
    ).toBe(true);
    expect(
      canPlace({
        blockType: "lattice.paragraph",
        document: doc,
        parentId: "c",
        slot: "col_1",
        types: testTypes,
      }),
    ).toBe(true);
  });

  it("rejects unknown parents and slots", () => {
    expect(
      canPlace({
        blockType: "lattice.paragraph",
        document: doc,
        parentId: "zzz",
        slot: "content",
        types: testTypes,
      }),
    ).toBe(false);
    expect(
      canPlace({
        blockType: "lattice.paragraph",
        document: doc,
        parentId: "c",
        slot: "col_9",
        types: testTypes,
      }),
    ).toBe(false);
  });

  it("lists the types a slot still accepts", () => {
    expect(allowedTypesFor(doc, testTypes, "s", "content").map((type) => type.type)).toEqual([
      "lattice.paragraph",
    ]);
    expect(allowedTypesFor(doc, testTypes, "c", "col_2")).toEqual([]);
    expect(allowedTypesFor(doc, testTypes, null, null)).toHaveLength(testTypes.length);
  });
});
