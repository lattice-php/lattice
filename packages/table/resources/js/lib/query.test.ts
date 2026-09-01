import { describe, expect, it } from "vitest";
import type { ColumnNode, ColumnPropsOf } from "@lattice-php/table/types";
import { getTableSizingColumns, orderPinnedColumns } from "./query";

function textColumn(
  key: string,
  props: Partial<ColumnPropsOf<"column.text">> = {},
): ColumnNode<"column.text"> {
  return {
    key,
    type: "column.text",
    props: {
      align: "start",
      badge: null,
      copyable: false,
      date: null,
      filter: null,
      hiddenByDefault: false,
      label: null,
      link: null,
      multiple: null,
      options: [],
      pinned: null,
      sortable: false,
      toggleable: false,
      width: "md",
      ...props,
    },
  };
}

describe("orderPinnedColumns", () => {
  it("moves pinned columns to their edges while keeping relative order stable", () => {
    const columns = ["a", "left1", "b", "right1", "c", "left2", "right2"];
    const pinned: Record<string, "start" | "end" | null> = {
      left1: "start",
      left2: "start",
      right1: "end",
      right2: "end",
    };

    expect(orderPinnedColumns(columns, (column) => pinned[column] ?? null)).toEqual([
      "left1",
      "left2",
      "a",
      "b",
      "c",
      "right1",
      "right2",
    ]);
  });

  it("is a no-op ordering when nothing is pinned", () => {
    const columns = ["a", "b", "c"];

    expect(orderPinnedColumns(columns, () => null)).toEqual(columns);
  });
});

describe("getTableSizingColumns", () => {
  it("omits pin when no accessor is given", () => {
    const columns = [textColumn("name"), textColumn("email")];

    expect(getTableSizingColumns(columns)).toEqual([
      { key: "name", label: null, pin: undefined, width: "md" },
      { key: "email", label: null, pin: undefined, width: "md" },
    ]);
  });

  it("derives pin per column from the given accessor", () => {
    const columns = [
      textColumn("name", { pinned: "start" }),
      textColumn("email"),
      textColumn("total", { pinned: "end" }),
    ];

    expect(getTableSizingColumns(columns, (column) => column.props.pinned)).toEqual([
      { key: "name", label: null, pin: "start", width: "md" },
      { key: "email", label: null, pin: undefined, width: "md" },
      { key: "total", label: null, pin: "end", width: "md" },
    ]);
  });
});
