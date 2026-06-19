import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { beforeEach, describe, expect, it } from "vitest";
import type { ColumnData } from "@lattice-php/lattice/types/generated";
import type { TableNode } from "../types";
import TableComponent from "./table";

const storageKey = "lattice:table-columns:browser.products";

function col(partial: Partial<ColumnData> & Pick<ColumnData, "key" | "label">): ColumnData {
  return {
    type: partial.type ?? "column.text",
    width: "md",
    sortable: null,
    filter: null,
    columns: null,
    props: null,
    align: "start",
    ...partial,
  };
}

function node(overrides: Partial<TableNode["props"]> = {}): TableNode {
  return {
    id: "browser.products",
    type: "table",
    props: {
      columns: [
        col({ key: "sku", label: "SKU", width: "sm" }),
        col({ key: "name", label: "Name", width: "md" }),
      ],
      data: [{ id: 1, sku: "SKU-001", name: "Desk Lamp" }],
      state: {
        filters: [],
        page: 1,
        perPage: 25,
        sorts: [],
      },
      ...overrides,
    },
  };
}

describe("Lattice table component in a browser", () => {
  beforeEach(async () => {
    await page.viewport(1280, 800);
    window.localStorage.clear();
  });

  it("renders the desktop table as a CSS grid and hides mobile labels", async () => {
    const screen = await render(
      <div style={{ width: "520px" }}>
        <TableComponent node={node()} />
      </div>,
    );
    const skuHeader = screen.getByRole("columnheader", { name: "SKU" }).element();
    const headerRow = skuHeader?.parentElement;
    const skuCell = screen.getByRole("cell", { name: "SKU-001" }).element();
    const bodyRow = skuCell.parentElement;
    const mobileLabel = skuCell.querySelector<HTMLElement>('span[aria-hidden="true"]');

    expect(headerRow).toBeInstanceOf(HTMLElement);
    expect(bodyRow).toBeInstanceOf(HTMLElement);
    expect(mobileLabel).toBeInstanceOf(HTMLElement);
    expect(getComputedStyle(headerRow as HTMLElement).display).toBe("grid");
    expect(getComputedStyle(bodyRow as HTMLElement).display).toBe("grid");
    expect(getComputedStyle(mobileLabel as HTMLElement).display).toBe("none");
  });

  it("keeps overflowing body cell content within the rendered column boundary", async () => {
    const longSku = `sku-${"x".repeat(120)}`;
    const screen = await render(
      <div style={{ width: "280px" }}>
        <TableComponent
          node={node({
            data: [{ id: 1, sku: longSku, name: "Desk Lamp" }],
          })}
        />
      </div>,
    );
    const cell = screen.getByRole("cell", { name: longSku }).element();
    const content = cell.querySelector<HTMLElement>('[data-slot="table-cell-content"]');

    expect(content).toBeInstanceOf(HTMLElement);

    const cellRect = cell.getBoundingClientRect();
    const contentRect = (content as HTMLElement).getBoundingClientRect();

    expect(contentRect.right).toBeLessThanOrEqual(cellRect.right + 0.5);
    expect((content as HTMLElement).scrollWidth).toBeGreaterThan(
      (content as HTMLElement).clientWidth,
    );
  });

  it("renders mobile rows as stacked labels below the desktop breakpoint", async () => {
    await page.viewport(390, 800);

    const screen = await render(<TableComponent node={node()} />);
    const skuHeader = Array.from(
      document.querySelectorAll<HTMLElement>('[role="columnheader"]'),
    ).find((element) => element.textContent?.trim() === "SKU");
    const headerRow = skuHeader?.parentElement;
    const skuText = screen.getByText("SKU-001").element();
    const skuCell = skuText.closest('[role="cell"]');
    const bodyRow = skuCell?.parentElement;
    const mobileLabel = skuCell?.querySelector<HTMLElement>('span[aria-hidden="true"]');

    expect(headerRow).toBeInstanceOf(HTMLElement);
    expect(skuCell).toBeInstanceOf(HTMLElement);
    expect(bodyRow).toBeInstanceOf(HTMLElement);
    expect(mobileLabel).toBeInstanceOf(HTMLElement);
    expect(getComputedStyle(headerRow as HTMLElement).display).toBe("none");
    expect(getComputedStyle(bodyRow as HTMLElement).display).toBe("grid");
    expect(getComputedStyle(bodyRow as HTMLElement).gridTemplateColumns.split(" ")).toHaveLength(1);
    expect(getComputedStyle(mobileLabel as HTMLElement).display).not.toBe("none");
  });

  it("hydrates stored column widths into the rendered desktop grid", async () => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ columns: ["sku", "name"], overrides: { sku: 180 } }),
    );

    const screen = await render(
      <div style={{ width: "520px" }}>
        <TableComponent node={node({ resizableColumns: true })} />
      </div>,
    );
    const skuHeader = screen.getByRole("columnheader", { name: "SKU" }).element();
    const headerRow = skuHeader.parentElement;

    expect(headerRow).toBeInstanceOf(HTMLElement);
    expect((headerRow as HTMLElement).style.getPropertyValue("--lattice-table-columns")).toBe(
      "180px minmax(8rem, 1fr)",
    );
    await expect.element(screen.getByTestId("table-reset-columns")).toBeInTheDocument();
  });

  it("removes stale stored column widths when rendered columns change", async () => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ columns: ["sku"], overrides: { sku: 240 } }),
    );

    const screen = await render(
      <div style={{ width: "520px" }}>
        <TableComponent node={node({ resizableColumns: true })} />
      </div>,
    );
    const skuHeader = screen.getByRole("columnheader", { name: "SKU" }).element();
    const headerRow = skuHeader.parentElement;

    expect(window.localStorage.getItem(storageKey)).toBeNull();
    expect(headerRow).toBeInstanceOf(HTMLElement);
    expect((headerRow as HTMLElement).style.getPropertyValue("--lattice-table-columns")).toBe(
      "minmax(6rem, 0.5fr) minmax(8rem, 1fr)",
    );
    await expect.element(screen.getByTestId("table-reset-columns")).not.toBeInTheDocument();
  });

  it("persists and resets resized column widths on the component", async () => {
    const screen = await render(
      <div style={{ width: "520px" }}>
        <TableComponent node={node({ resizableColumns: true })} />
      </div>,
    );
    const handle = screen.getByRole("separator", { name: "Resize SKU" }).element();

    handle.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }));

    await expect
      .poll(() => window.localStorage.getItem(storageKey))
      .toBe(JSON.stringify({ columns: ["sku", "name"], overrides: { sku: 136 } }));

    await expect.element(screen.getByTestId("table-reset-columns")).toBeInTheDocument();
    await screen.getByTestId("table-reset-columns").click();

    await expect.poll(() => window.localStorage.getItem(storageKey)).toBeNull();
    await expect.element(screen.getByTestId("table-reset-columns")).not.toBeInTheDocument();
  });

  it("double-clicking a resize handle resets only that column width", async () => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ columns: ["sku", "name"], overrides: { sku: 176, name: 224 } }),
    );

    const screen = await render(
      <div style={{ width: "620px" }}>
        <TableComponent node={node({ resizableColumns: true })} />
      </div>,
    );
    const handle = screen.getByRole("separator", { name: "Resize SKU" }).element();
    const skuHeader = screen.getByRole("columnheader", { name: "SKU" }).element();
    const headerRow = skuHeader.parentElement;

    handle.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));

    await expect
      .poll(() => window.localStorage.getItem(storageKey))
      .toBe(JSON.stringify({ columns: ["sku", "name"], overrides: { name: 224 } }));
    expect(headerRow).toBeInstanceOf(HTMLElement);
    expect((headerRow as HTMLElement).style.getPropertyValue("--lattice-table-columns")).toBe(
      "minmax(6rem, 0.5fr) 224px",
    );
    await expect.element(screen.getByTestId("table-reset-columns")).toBeInTheDocument();
  });
});
