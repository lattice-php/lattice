import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ColumnPropsOf, TableColumn, TableRow } from "@lattice-php/lattice/table/types";
import { TextCell } from "./text-cell";

function renderCell(props: Record<string, unknown>, value: unknown, row: TableRow = {}) {
  const column = {
    key: "tags",
    type: "column.text",
    props: {
      label: "Tags",
      width: "md",
      align: "start",
      sortable: false,
      toggleable: false,
      hiddenByDefault: false,
      filter: null,
      ...props,
    },
  } as TableColumn;

  return render(
    <TextCell
      column={column}
      props={column.props as ColumnPropsOf<"column.text">}
      row={row}
      value={value}
    />,
  );
}

describe("TextCell", () => {
  it("renders a plain value when no modifiers are set", () => {
    renderCell({}, "Hello");

    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("joins a multiple column without a badge", () => {
    renderCell({ multiple: "name" }, ["New", "Sale"]);

    expect(screen.getByText("New, Sale")).toBeInTheDocument();
  });

  it("renders a css row colour as an inline tone pair", () => {
    renderCell({ badge: { colorKey: "color" } }, "Active", { color: "#dc2626" });

    const badge = screen.getByText("Active");
    expect(badge.style.getPropertyValue("--lt-tone-fg")).toBe("#dc2626");
  });

  it("renders nothing for an empty multiple column", () => {
    const { container } = renderCell({ multiple: "name", badge: { colorKey: "color" } }, []);

    expect(container).toBeEmptyDOMElement();
  });
});
