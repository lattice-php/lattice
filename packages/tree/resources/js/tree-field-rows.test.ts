import { describe, expect, it } from "vitest";
import {
  canPlace,
  childrenOf,
  findPath,
  moveNode,
  rowAtPath,
  subtreeHeight,
  type TreeRow,
} from "./tree-field-rows";

const row = (rowId: string, children: TreeRow[] = []): TreeRow => ({
  rowId,
  type: "node",
  ...(children.length > 0 ? { children } : {}),
});

const tree = (): TreeRow[] => [
  row("a", [row("a1"), row("a2")]),
  row("b"),
  row("c", [row("c1", [row("c1x")])]),
];

const ids = (rows: TreeRow[]): string[] => rows.map((r) => String(r.rowId));

describe("findPath / rowAtPath", () => {
  it("locates rows at any depth", () => {
    expect(findPath(tree(), "b")).toEqual([1]);
    expect(findPath(tree(), "a2")).toEqual([0, 1]);
    expect(findPath(tree(), "c1x")).toEqual([2, 0, 0]);
    expect(findPath(tree(), "missing")).toBeNull();
    expect(rowAtPath(tree(), [2, 0, 0])?.rowId).toBe("c1x");
  });
});

describe("subtreeHeight", () => {
  it("counts the levels a subtree occupies", () => {
    expect(subtreeHeight(row("leaf"))).toBe(1);
    expect(subtreeHeight(tree()[0])).toBe(2);
    expect(subtreeHeight(tree()[2])).toBe(3);
  });
});

describe("moveNode", () => {
  it("reorders within the same level, adjusting for the removed slot", () => {
    const moved = moveNode(tree(), "a", null, 2);
    expect(ids(moved)).toEqual(["b", "a", "c"]);
  });

  it("moves a row under a new parent at the given index", () => {
    const moved = moveNode(tree(), "b", "a", 1);
    expect(ids(moved)).toEqual(["a", "c"]);
    expect(ids(childrenOf(moved[0]))).toEqual(["a1", "b", "a2"]);
  });

  it("moves a subtree with its children intact", () => {
    const moved = moveNode(tree(), "c", "a", 0);
    const nested = childrenOf(moved[0]);
    expect(ids(nested)).toEqual(["c", "a1", "a2"]);
    expect(ids(childrenOf(nested[0]))).toEqual(["c1"]);
  });

  it("moves a nested row up to the root level", () => {
    const moved = moveNode(tree(), "a2", null, 0);
    expect(ids(moved)).toEqual(["a2", "a", "b", "c"]);
    expect(ids(childrenOf(moved[1]))).toEqual(["a1"]);
  });

  it("adjusts the parent path when the source sits before it on the same level", () => {
    const moved = moveNode(tree(), "a", "c", 0);
    expect(ids(moved)).toEqual(["b", "c"]);
    expect(ids(childrenOf(moved[1]))).toEqual(["a", "c1"]);
  });

  it("refuses to move a row into its own subtree", () => {
    const rows = tree();
    expect(moveNode(rows, "c", "c1", 0)).toBe(rows);
    expect(moveNode(rows, "c", "c", 0)).toBe(rows);
  });

  it("returns the input for unknown rows", () => {
    const rows = tree();
    expect(moveNode(rows, "missing", null, 0)).toBe(rows);
    expect(moveNode(rows, "a", "missing", 0)).toBe(rows);
  });

  it("does not mutate the input", () => {
    const rows = tree();
    moveNode(rows, "b", "a", 0);
    expect(ids(rows)).toEqual(["a", "b", "c"]);
    expect(ids(childrenOf(rows[0]))).toEqual(["a1", "a2"]);
  });
});

describe("canPlace", () => {
  const accepting = { maxDepth: null, acceptsChildren: () => true };

  it("rejects a parent inside the source subtree", () => {
    expect(canPlace(tree(), "c", "c1x", accepting)).toBe(false);
    expect(canPlace(tree(), "c", "c", accepting)).toBe(false);
    expect(canPlace(tree(), "b", "a", accepting)).toBe(true);
  });

  it("rejects a parent that does not accept children", () => {
    const options = {
      maxDepth: null,
      acceptsChildren: (parent: TreeRow) => parent.rowId !== "b",
    };
    expect(canPlace(tree(), "a1", "b", options)).toBe(false);
    expect(canPlace(tree(), "a1", "c", options)).toBe(true);
  });

  it("enforces max depth against the subtree height", () => {
    const options = { maxDepth: 2, acceptsChildren: () => true };
    expect(canPlace(tree(), "b", "a", options)).toBe(true);
    expect(canPlace(tree(), "a", "b", options)).toBe(false);
    expect(canPlace(tree(), "c", null, options)).toBe(false);
    expect(canPlace(tree(), "a", null, options)).toBe(true);
  });
});
