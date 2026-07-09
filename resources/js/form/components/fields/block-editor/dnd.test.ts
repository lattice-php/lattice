import { describe, expect, it } from "vitest";
import { decodePath, encodePath, resolveMove } from "./dnd";

describe("dnd path ids", () => {
  it("round-trips a top-level path", () => {
    expect(encodePath([{ index: 2 }])).toBe("2");
    expect(decodePath("2")).toEqual([{ index: 2 }]);
  });

  it("round-trips a slot path", () => {
    expect(encodePath([{ index: 1, slot: "left" }, { index: 0 }])).toBe("1.left.0");
    expect(decodePath("1.left.0")).toEqual([{ index: 1, slot: "left" }, { index: 0 }]);
  });

  it("resolves a drag between two ids to move arguments", () => {
    expect(resolveMove("0", "1.left.0")).toEqual({
      from: [{ index: 0 }],
      to: [{ index: 1, slot: "left" }, { index: 0 }],
    });
  });
});
