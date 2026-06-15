import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TableColumn } from "../../types";
import { NumberCell } from "./number-cell";

const column = { key: "price", label: "Price", type: "number" } as TableColumn;

function renderCell(value: unknown) {
  return render(<NumberCell column={column} props={{}} row={{}} value={value} />);
}

describe("NumberCell", () => {
  it("formats a numeric value and right-aligns it", () => {
    const { container } = renderCell(1234.5);
    const span = container.querySelector("span");

    expect(span?.className).toContain("text-right");
    expect(span?.textContent).toBe(new Intl.NumberFormat().format(1234.5));
  });

  it("formats a numeric string", () => {
    const { container } = renderCell("42");

    expect(container.textContent).toBe(new Intl.NumberFormat().format(42));
  });

  it("falls back to the raw text for non-numeric values", () => {
    const { container } = renderCell("n/a");

    expect(container.textContent).toBe("n/a");
  });

  it("renders empty for null and undefined", () => {
    expect(renderCell(null).container.textContent).toBe("");
    expect(renderCell(undefined).container.textContent).toBe("");
  });
});
