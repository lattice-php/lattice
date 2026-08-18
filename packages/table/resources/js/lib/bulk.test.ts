import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { getBulkActionNodes } from "./bulk";
import type { ActionNode } from "@lattice-php/table/types";

describe("getBulkActionNodes", () => {
  it.each([undefined, []])("returns an empty list for %o", (bulkActions) => {
    expect(getBulkActionNodes(bulkActions)).toEqual([]);
  });

  it("skips action.group nodes", () => {
    const group = fakeNode({
      type: "action.group",
      id: "group",
      props: { label: "Group", orientation: null, ref: null },
    }) as ActionNode;

    expect(getBulkActionNodes([group])).toEqual([]);
  });

  it("skips actions without an endpoint", () => {
    const node = fakeNode({
      type: "action",
      id: "no-endpoint",
      props: { label: "No endpoint" },
    }) as ActionNode;

    expect(getBulkActionNodes([node])).toEqual([]);
  });
});
