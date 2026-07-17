import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ColumnPropsOf, TableColumn } from "@lattice-php/lattice/table/types";
import { ImageCell } from "./image-cell";

function column(props: Record<string, unknown> = {}): TableColumn {
  return {
    key: "image",
    type: "column.image",
    props: {
      label: "Image",
      width: "md",
      align: "start",
      sortable: false,
      toggleable: false,
      hiddenByDefault: false,
      filter: null,
      circular: false,
      size: null,
      previewable: true,
      ...props,
    },
  } as TableColumn;
}

function renderCell(value: unknown, props: Record<string, unknown> = {}) {
  const col = column(props);
  return render(
    <ImageCell
      column={col}
      props={col.props as ColumnPropsOf<"column.image">}
      row={{}}
      value={value}
    />,
  );
}

describe("ImageCell", () => {
  it("renders nothing for an empty value", () => {
    const { container } = renderCell("");
    expect(container).toBeEmptyDOMElement();
  });

  it("opens the lightbox on click by default", () => {
    renderCell("https://example.test/p.png");

    fireEvent.click(screen.getByRole("button", { name: "View image" }));

    expect(document.querySelector('[data-slot="image-lightbox"]')).toBeInTheDocument();
  });

  it("renders a plain image when previewable is off", () => {
    renderCell("https://example.test/p.png", { previewable: false });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByAltText("Image")).toBeVisible();
  });

  it("keeps the configured size and circular rounding", () => {
    renderCell("https://example.test/p.png", { circular: true, size: 44 });

    const image = screen.getByAltText("Image");
    expect(image).toHaveClass("rounded-full");
    expect(image).toHaveAttribute("width", "44");
  });
});
