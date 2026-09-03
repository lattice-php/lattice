import { describe, expect, it } from "vitest";
import { block, document } from "../test-support";
import {
  changedDataBlocks,
  duplicateBlock,
  findBlock,
  flattenDocument,
  insertBlock,
  moveBlock,
  pathTo,
  reconcileSlots,
  removeBlock,
  updateBlock,
} from "./tree";

const doc = document(
  block("h", "lattice.heading", { text: "Hi" }),
  block(
    "c",
    "lattice.columns",
    {},
    {
      col_1: [block("p1", "lattice.paragraph", { text: "one" })],
      col_2: [
        block("p2", "lattice.paragraph", { text: "two" }),
        block("p3", "lattice.paragraph", { text: "three" }),
      ],
    },
  ),
);

describe("flattenDocument", () => {
  it("lists blocks depth-first with their slot position", () => {
    expect(
      flattenDocument(doc).map((entry) => [
        entry.node.id,
        entry.parentId,
        entry.slot,
        entry.index,
        entry.depth,
      ]),
    ).toEqual([
      ["h", null, null, 0, 0],
      ["c", null, null, 1, 0],
      ["p1", "c", "col_1", 0, 1],
      ["p2", "c", "col_2", 0, 1],
      ["p3", "c", "col_2", 1, 1],
    ]);
  });
});

describe("insertBlock / removeBlock", () => {
  it("inserts into a slot at a clamped index and leaves untouched branches identical", () => {
    const next = insertBlock(doc, block("n", "lattice.paragraph"), {
      index: 99,
      parentId: "c",
      slot: "col_1",
    });

    expect(findBlock(next, "n")).toMatchObject({ index: 1, parentId: "c", slot: "col_1" });
    expect(next.blocks[0]).toBe(doc.blocks[0]);
  });

  it("removes a nested block and returns the same document for an unknown id", () => {
    expect(findBlock(removeBlock(doc, "p2"), "p2")).toBeNull();
    expect(removeBlock(doc, "nope")).toBe(doc);
  });
});

describe("moveBlock", () => {
  it("adjusts the index when moving down within the same list", () => {
    const next = moveBlock(doc, "p2", { index: 2, parentId: "c", slot: "col_2" });

    expect(findBlock(next, "c")?.node.slots.col_2?.map((node) => node.id)).toEqual(["p3", "p2"]);
  });

  it("moves across slots and to the root", () => {
    const across = moveBlock(doc, "p1", { index: 0, parentId: "c", slot: "col_2" });
    expect(findBlock(across, "c")?.node.slots.col_2?.map((node) => node.id)).toEqual([
      "p1",
      "p2",
      "p3",
    ]);
    expect(findBlock(across, "c")?.node.slots.col_1).toEqual([]);

    const toRoot = moveBlock(doc, "p3", { index: 0, parentId: null, slot: null });
    expect(toRoot.blocks.map((node) => node.id)).toEqual(["p3", "h", "c"]);
  });

  it("refuses to move a block into its own descendant or into itself", () => {
    expect(moveBlock(doc, "c", { index: 0, parentId: "p1", slot: "x" })).toBe(doc);
    expect(moveBlock(doc, "c", { index: 0, parentId: "p3", slot: "x" })).toBe(doc);
    expect(moveBlock(doc, "c", { index: 0, parentId: "c", slot: "col_1" })).toBe(doc);
  });

  it("answers repeated lookups on one document from the same index", () => {
    const first = findBlock(doc, "p3");

    expect(findBlock(doc, "p3")).toBe(first);
    expect(
      findBlock(moveBlock(doc, "p3", { index: 0, parentId: null, slot: null }), "p3"),
    ).not.toBe(first);
  });
});

describe("duplicateBlock", () => {
  it("copies the block after itself with fresh ids on every descendant and no anchor", () => {
    const withAnchor = updateBlock(doc, "c", (node) => ({
      ...node,
      style: { ...node.style, anchor: "cols" },
    }));
    const { document: next, id } = duplicateBlock(withAnchor, "c");
    const copy = id ? findBlock(next, id) : null;

    expect(copy).toMatchObject({ index: 2, parentId: null });
    expect(copy?.node.style.anchor).toBeNull();
    expect(copy?.node.slots.col_2).toHaveLength(2);
    expect(copy?.node.slots.col_2?.[0]?.id).not.toBe("p2");
    expect(flattenDocument(next)).toHaveLength(9);
  });
});

describe("reconcileSlots", () => {
  it("moves children of vanished slots to the end of the last remaining slot", () => {
    const next = reconcileSlots(doc, "c", ["col_1"]);

    expect(findBlock(next, "c")?.node.slots).toEqual({
      col_1: [
        expect.objectContaining({ id: "p1" }),
        expect.objectContaining({ id: "p2" }),
        expect.objectContaining({ id: "p3" }),
      ],
    });
  });

  it("is a no-op when every populated slot still renders", () => {
    expect(reconcileSlots(doc, "c", ["col_1", "col_2", "col_3"])).toBe(doc);
    expect(reconcileSlots(doc, "c", [])).toBe(doc);
  });
});

describe("pathTo / changedDataBlocks", () => {
  it("returns the ancestry from root to the block", () => {
    expect(pathTo(doc, "p3").map((entry) => entry.node.id)).toEqual(["c", "p3"]);
  });

  it("reports blocks whose data changed, including restored ones", () => {
    const edited = updateBlock(doc, "p1", (node) => ({ ...node, data: { text: "uno" } }));
    const moved = moveBlock(doc, "p3", { index: 0, parentId: null, slot: null });

    expect(changedDataBlocks(doc, edited)).toEqual(["p1"]);
    expect(changedDataBlocks(doc, moved)).toEqual([]);
    expect(changedDataBlocks(removeBlock(doc, "h"), doc)).toEqual(["h"]);
  });
});
