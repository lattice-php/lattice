import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ColumnPropsOf, TableColumn } from "@lattice-php/table/types";
import { BooleanCell } from "./boolean-cell";

const column = {
  key: "featured",
  type: "column.boolean",
  props: {
    label: "Featured",
    width: "md",
    align: "start",
    sortable: false,
    toggleable: false,
    hiddenByDefault: false,
    filter: null,
  },
} as TableColumn;

function renderCell(value: unknown) {
  return render(
    <BooleanCell
      column={column}
      props={column.props as ColumnPropsOf<"column.boolean">}
      row={{}}
      value={value}
    />,
  );
}

describe("BooleanCell", () => {
  it.each([true, 1, "1", "true"])("treats %s as truthy", (value) => {
    renderCell(value);

    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Yes");
  });

  it.each([false, 0, "0", "", null, undefined])("treats %s as falsy", (value) => {
    renderCell(value);

    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "No");
  });
});
