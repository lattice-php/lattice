import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ColumnPropsOf, TableColumn } from "@lattice-php/lattice/table/types";
import { NumberCell } from "./number-cell";

function column(props: Record<string, unknown> = {}): TableColumn {
  return {
    key: "price",
    type: "column.number",
    props: {
      label: "Price",
      width: "md",
      align: "end",
      sortable: false,
      toggleable: false,
      hiddenByDefault: false,
      filter: null,
      ...props,
    },
  } as TableColumn;
}

function renderCell(value: unknown, props: Record<string, unknown> = {}) {
  const col = column(props);
  return render(
    <NumberCell
      column={col}
      props={col.props as ColumnPropsOf<"column.number">}
      row={{}}
      value={value}
    />,
  );
}

afterEach(() => {
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
  vi.restoreAllMocks();
});

describe("NumberCell", () => {
  it("formats with the configured fraction digits", () => {
    const { container } = renderCell(1234.5, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    expect(container.textContent).toBe(
      new Intl.NumberFormat("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        1234.5,
      ),
    );
  });

  it("renders percent without multiplying", () => {
    const { container } = renderCell(50, { unit: "percent" });
    expect(container.textContent).toBe(
      new Intl.NumberFormat("en", { style: "unit", unit: "percent" }).format(50),
    );
  });

  it("falls back to raw text for non-numeric values", () => {
    expect(renderCell("n/a").container.textContent).toBe("n/a");
  });

  it("renders empty for null and undefined", () => {
    expect(renderCell(null).container.textContent).toBe("");
    expect(renderCell(undefined).container.textContent).toBe("");
  });

  it("renders compact notation", () => {
    const { container } = renderCell(28000, { compact: true });
    expect(container.textContent).toBe("28K");
  });

  it("renders no copy button by default", () => {
    renderCell(1234.5);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("copies the raw value instead of the formatted text when copyable", () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });

    renderCell(1234.5, { copyable: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });

    fireEvent.click(screen.getByRole("button", { name: "Copy Price" }));

    expect(writeText).toHaveBeenCalledWith("1234.5");
  });
});
