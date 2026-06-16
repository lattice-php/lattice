import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TableColumn } from "../../types";
import { NumberCell } from "./number-cell";

function column(props: Record<string, unknown> = {}): TableColumn {
  return {
    key: "price",
    label: "Price",
    type: "column.number",
    align: "end",
    props,
  } as TableColumn;
}

function renderCell(value: unknown, props: Record<string, unknown> = {}) {
  const col = column(props);
  return render(<NumberCell column={col} props={col.props as never} row={{}} value={value} />);
}

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
});
