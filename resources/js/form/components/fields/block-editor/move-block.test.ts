import { describe, expect, it } from "vitest";
import { moveBlock } from "./move-block";

const rows = () => [
  { __rowId: "a", type: "text", body: "A" },
  {
    __rowId: "cols",
    type: "columns",
    slots: {
      left: [{ __rowId: "l1", type: "text", body: "L1" }],
      right: [{ __rowId: "r1", type: "text", body: "R1" }],
    },
  },
];

describe("moveBlock", () => {
  it("reorders at the top level", () => {
    const out = moveBlock(rows(), [{ index: 0 }], [{ index: 1 }]);
    expect(out.map((r) => r.__rowId)).toEqual(["cols", "a"]);
  });

  it("moves a top-level block into a slot", () => {
    const out = moveBlock(rows(), [{ index: 0 }], [{ index: 1, slot: "left" }, { index: 1 }]);
    const cols = out.find((r) => r.__rowId === "cols") as Record<string, any>;
    expect(cols.slots.left.map((r: any) => r.__rowId)).toEqual(["l1", "a"]);
    expect(out.map((r) => r.__rowId)).toEqual(["cols"]);
  });

  it("moves a block between slots", () => {
    const out = moveBlock(
      rows(),
      [{ index: 1, slot: "left" }, { index: 0 }],
      [{ index: 1, slot: "right" }, { index: 0 }],
    );
    const cols = out.find((r) => r.__rowId === "cols") as Record<string, any>;
    expect(cols.slots.left).toEqual([]);
    expect(cols.slots.right.map((r: any) => r.__rowId)).toEqual(["l1", "r1"]);
  });

  it("moves a block out of a slot back to the top level", () => {
    const out = moveBlock(rows(), [{ index: 1, slot: "left" }, { index: 0 }], [{ index: 0 }]);
    expect(out.map((r) => r.__rowId)).toEqual(["l1", "a", "cols"]);
  });

  it("returns rows unchanged for an invalid source", () => {
    const input = rows();
    expect(moveBlock(input, [{ index: 9 }], [{ index: 0 }])).toBe(input);
  });

  it("moves a block into a deeper nested container without dropping a later sibling", () => {
    const nested = [
      {
        __rowId: "outer",
        slots: {
          left: [{ __rowId: "P" }, { __rowId: "Q", slots: { inner: [{ __rowId: "R" }] } }],
        },
      },
    ];

    const out = moveBlock(
      nested,
      [{ index: 0, slot: "left" }, { index: 0 }],
      [{ index: 0, slot: "left" }, { index: 1, slot: "inner" }, { index: 0 }],
    );

    const outer = out.find((r) => r.__rowId === "outer") as Record<string, any>;
    expect(outer.slots.left.map((r: any) => r.__rowId)).toEqual(["Q"]);
    const q = outer.slots.left.find((r: any) => r.__rowId === "Q");
    expect(q.slots.inner.map((r: any) => r.__rowId)).toEqual(["P", "R"]);
  });

  it("returns rows unchanged for an invalid target", () => {
    const input = rows();
    const out = moveBlock(
      input,
      [{ index: 1, slot: "left" }, { index: 0 }],
      [{ index: 5, slot: "left" }, { index: 0 }],
    );
    expect(out).toBe(input);
  });
});
