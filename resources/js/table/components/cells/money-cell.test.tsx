import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TableColumn, TableRow } from "../../types";
import { MoneyCell } from "./money-cell";

function column(props: Record<string, unknown>): TableColumn {
  return { key: "total", label: "Total", type: "money", align: "end", props } as TableColumn;
}

function renderCell(value: unknown, props: Record<string, unknown>, row: TableRow = {}) {
  const col = column(props);
  return render(<MoneyCell column={col} props={col.props as never} row={row} value={value} />);
}

describe("MoneyCell", () => {
  it("formats with a static currency", () => {
    const { container } = renderCell(1234.5, { currency: "EUR" });
    expect(container.textContent).toBe(
      new Intl.NumberFormat("en", { style: "currency", currency: "EUR" }).format(1234.5),
    );
  });

  it("reads the currency from the row when currencyField is set", () => {
    const { container } = renderCell(1000, { currencyField: "currency" }, { currency: "JPY" });
    expect(container.textContent).toBe(
      new Intl.NumberFormat("en", { style: "currency", currency: "JPY" }).format(1000),
    );
  });

  it("falls back to a plain number when no currency resolves", () => {
    const { container } = renderCell(42, { currencyField: "currency" }, {});
    expect(container.textContent).toBe(new Intl.NumberFormat("en").format(42));
  });
});
