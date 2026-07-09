import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TableColumn } from "../../types";
import { BooleanCell } from "./boolean-cell";

const column = {
  key: "featured",
  type: "column.boolean",
  props: {
    label: "Featured",
    width: "md",
    align: "start",
    sortable: null,
    toggleable: null,
    hiddenByDefault: null,
    filter: null,
  },
} as TableColumn;

function renderCell(value: unknown) {
  return render(
    <BooleanCell column={column} props={column.props as never} row={{}} value={value} />,
  );
}

describe("BooleanCell", () => {
  it("renders a check for truthy values", () => {
    const { container } = renderCell(true);

    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "true");
    expect(container.querySelector("use")).toHaveAttribute("href", "#check");
  });

  it("renders a cross for falsy values", () => {
    const { container } = renderCell(false);

    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "false");
    expect(container.querySelector("use")).toHaveAttribute("href", "#x");
  });

  it.each([1, "1", "true"])("treats %s as truthy", (value) => {
    const { container } = renderCell(value);

    expect(container.querySelector("use")).toHaveAttribute("href", "#check");
  });

  it.each([0, "0", "", null, undefined])("treats %s as falsy", (value) => {
    const { container } = renderCell(value);

    expect(container.querySelector("use")).toHaveAttribute("href", "#x");
  });
});
