import { describe, expect, it } from "vitest";
import {
  appendBlockAt,
  blockAt,
  removeBlockAt,
  slotAllowedTypes,
  updateBlockAt,
  walkBlocks,
} from "./tree";

const rows = () => [
  { rowId: "a", type: "text", body: "A" },
  {
    rowId: "cols",
    type: "columns",
    slots: {
      main: [{ rowId: "m1", type: "text", body: "M1" }],
    },
  },
];

describe("blockAt", () => {
  it("resolves a top-level block", () => {
    expect(blockAt(rows(), [{ index: 1 }])?.rowId).toBe("cols");
  });

  it("resolves a nested block", () => {
    expect(blockAt(rows(), [{ index: 1, slot: "main" }, { index: 0 }])?.rowId).toBe("m1");
  });

  it("returns null for a missing path", () => {
    expect(blockAt(rows(), [{ index: 5 }])).toBeNull();
  });
});

describe("updateBlockAt", () => {
  it("updates a field on a nested block without touching siblings", () => {
    const input = rows();
    const out = updateBlockAt(input, [{ index: 1, slot: "main" }, { index: 0 }], "body", "Edited");

    expect(blockAt(out, [{ index: 1, slot: "main" }, { index: 0 }])?.body).toBe("Edited");
    expect(out[0]).toBe(input[0]);
  });
});

describe("removeBlockAt", () => {
  it("removes a nested block", () => {
    const out = removeBlockAt(rows(), [{ index: 1, slot: "main" }, { index: 0 }]);

    expect(blockAt(out, [{ index: 1 }])?.slots).toEqual({ main: [] });
  });

  it("removes a top-level block", () => {
    const out = removeBlockAt(rows(), [{ index: 0 }]);

    expect(out.map((row) => row.rowId)).toEqual(["cols"]);
  });
});

describe("appendBlockAt", () => {
  it("appends a row to a named slot of the addressed block", () => {
    const out = appendBlockAt(rows(), [{ index: 1 }], "main", { rowId: "m2", type: "text" });

    const slot = blockAt(out, [{ index: 1 }])?.slots as Record<string, { rowId: string }[]>;
    expect(slot.main.map((row) => row.rowId)).toEqual(["m1", "m2"]);
  });

  it("creates the slot list when the block has none yet", () => {
    const out = appendBlockAt(rows(), [{ index: 0 }], "main", { rowId: "new", type: "text" });

    const slot = blockAt(out, [{ index: 0 }])?.slots as Record<string, { rowId: string }[]>;
    expect(slot.main.map((row) => row.rowId)).toEqual(["new"]);
  });
});

describe("slotAllowedTypes", () => {
  const templates = [
    { type: "hero", label: "Hero", schema: [] },
    { type: "columns", label: "Columns", schema: [], slots: [{ name: "main" }] },
    {
      type: "restricted",
      label: "Restricted",
      schema: [],
      slots: [{ name: "main", blocks: ["hero"] }],
    },
  ] as never[];

  it("returns the restriction of the containing slot", () => {
    const value = [{ rowId: "r1", type: "restricted", slots: { main: [] } }];

    expect(
      slotAllowedTypes(templates as never, value, [{ index: 0, slot: "main" }, { index: 0 }]),
    ).toEqual(["hero"]);
  });

  it("returns null for an unrestricted slot", () => {
    expect(
      slotAllowedTypes(templates as never, rows(), [{ index: 1, slot: "main" }, { index: 0 }]),
    ).toBeNull();
  });

  it("returns null at the top level", () => {
    expect(slotAllowedTypes(templates as never, rows(), [{ index: 0 }])).toBeNull();
  });
});

describe("walkBlocks", () => {
  it("flattens the tree depth-first with a path per block", () => {
    const entries = walkBlocks(rows());

    expect(entries.map((entry) => entry.row.rowId)).toEqual(["a", "cols", "m1"]);
    expect(entries[2].path).toEqual([{ index: 1, slot: "main" }, { index: 0 }]);
  });
});
