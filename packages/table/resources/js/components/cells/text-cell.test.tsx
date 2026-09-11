import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ColumnPropsOf, TableColumn, TableRow } from "@lattice-php/table/types";
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
  it("joins a multiple column without a badge", () => {
    renderCell({ multiple: "name" }, ["New", "Sale"]);

    expect(screen.getByText("New, Sale")).toBeInTheDocument();
  });

  it("labels each item of a list value through the column options", () => {
    renderCell(
      {
        options: [
          { label: "Authorization code", value: "authorization_code" },
          { label: "Refresh token", value: "refresh_token" },
        ],
      },
      ["authorization_code", "refresh_token"],
    );

    expect(screen.getByText("Authorization code, Refresh token")).toBeInTheDocument();
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

  it("opens the popover trigger on click when the row carries a popover for the column", () => {
    renderCell({}, "Ada Lovelace", {
      popovers: { tags: { type: "text", props: { text: "Customer card" } } },
    });

    const trigger = screen.getByRole("button", { name: "Ada Lovelace" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
