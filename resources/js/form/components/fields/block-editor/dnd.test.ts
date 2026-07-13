import { describe, expect, it } from "vitest";
import { dropDepth, resolveDrop, slotDropId } from "./dnd";

const rows = () => [
  { rowId: "a", type: "text" },
  {
    rowId: "cols",
    type: "columns",
    slots: {
      main: [{ rowId: "m1", type: "text" }],
      side: [],
    },
  },
];

describe("resolveDrop", () => {
  it("resolves a drop onto another shell to its path", () => {
    expect(resolveDrop(rows(), "a", "m1")).toEqual({
      from: [{ index: 0 }],
      to: [{ index: 1, slot: "main" }, { index: 0 }],
    });
  });

  it("resolves a drop onto an empty slot placeholder to its first position", () => {
    expect(resolveDrop(rows(), "m1", slotDropId("cols", "side"))).toEqual({
      from: [{ index: 1, slot: "main" }, { index: 0 }],
      to: [{ index: 1, slot: "side" }, { index: 0 }],
    });
  });

  it("returns null when the dragged block is unknown", () => {
    expect(resolveDrop(rows(), "gone", "a")).toBeNull();
  });

  it("returns null when the target is unknown", () => {
    expect(resolveDrop(rows(), "a", slotDropId("gone", "main"))).toBeNull();
  });
});

describe("dropDepth", () => {
  it("ranks nested shells deeper than top-level shells", () => {
    expect(dropDepth(rows(), "m1")).toBeGreaterThan(dropDepth(rows(), "cols"));
  });

  it("ranks a slot placeholder deeper than its parent shell", () => {
    expect(dropDepth(rows(), slotDropId("cols", "side"))).toBeGreaterThan(
      dropDepth(rows(), "cols"),
    );
  });

  it("ranks unknown ids lowest", () => {
    expect(dropDepth(rows(), "gone")).toBe(0);
  });
});
