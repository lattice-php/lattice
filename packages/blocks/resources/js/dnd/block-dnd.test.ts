import { describe, expect, it } from "vitest";
import { block, columnsType, document, testTypes, textOnlySectionType } from "../test-support";
import {
  blockDragData,
  dragSourceOf,
  dropAllowed,
  libraryDragData,
  resolveDropTarget,
  slotDropTargetData,
} from "./block-dnd";

const doc = document(
  block("h", "lattice.heading"),
  block(
    "c",
    columnsType.type,
    {},
    { col_1: [block("a", "lattice.paragraph"), block("b", "lattice.paragraph")], col_2: [] },
  ),
  block("s", textOnlySectionType.type, {}, { content: [] }),
);

const edgeTarget = (blockId: string, edge: "top" | "bottom") => ({
  data: { blockId, edge, kind: "block" },
});

describe("drag payloads", () => {
  it("round-trips block and library drag data and rejects foreign payloads", () => {
    expect(dragSourceOf(blockDragData("a", "lattice.paragraph"))).toEqual({
      blockType: "lattice.paragraph",
      id: "a",
      kind: "block",
    });
    expect(dragSourceOf(libraryDragData("lattice.heading"))).toEqual({
      blockType: "lattice.heading",
      kind: "library",
    });
    expect(dragSourceOf({ type: "something-else" })).toBeNull();
  });
});

describe("resolveDropTarget", () => {
  it("appends to a slot target", () => {
    expect(resolveDropTarget(doc, [{ data: slotDropTargetData("c", "col_1") }], null)).toEqual({
      index: 2,
      parentId: "c",
      slot: "col_1",
    });
    expect(resolveDropTarget(doc, [{ data: slotDropTargetData(null, null) }], null)).toEqual({
      index: 3,
      parentId: null,
      slot: null,
    });
  });

  it("uses the closest edge of a block target for a foreign block", () => {
    const source = { blockType: "lattice.heading", id: "h", kind: "block" } as const;

    expect(resolveDropTarget(doc, [edgeTarget("b", "top")], source)).toEqual({
      index: 1,
      parentId: "c",
      slot: "col_1",
    });
    expect(resolveDropTarget(doc, [edgeTarget("b", "bottom")], source)).toEqual({
      index: 2,
      parentId: "c",
      slot: "col_1",
    });
  });

  it("does not shift a same-list reorder onto itself", () => {
    const source = { blockType: "lattice.paragraph", id: "a", kind: "block" } as const;

    expect(resolveDropTarget(doc, [edgeTarget("b", "top")], source)).toEqual({
      index: 0,
      parentId: "c",
      slot: "col_1",
    });
    expect(resolveDropTarget(doc, [edgeTarget("b", "bottom")], source)).toEqual({
      index: 2,
      parentId: "c",
      slot: "col_1",
    });
  });

  it("returns null without a target", () => {
    expect(resolveDropTarget(doc, [], null)).toBeNull();
  });
});

describe("dropAllowed", () => {
  it("applies the slot rules to the dragged type", () => {
    expect(
      dropAllowed(
        doc,
        testTypes,
        { blockType: "lattice.heading", kind: "library" },
        { index: 0, parentId: "s", slot: "content" },
      ),
    ).toBe(false);
    expect(
      dropAllowed(
        doc,
        testTypes,
        { blockType: "lattice.paragraph", id: "a", kind: "block" },
        { index: 0, parentId: "s", slot: "content" },
      ),
    ).toBe(true);
  });
});
