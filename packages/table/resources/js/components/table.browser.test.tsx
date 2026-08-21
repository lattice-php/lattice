import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { beforeEach, describe, expect, it } from "vitest";
import type { TableNode } from "@lattice-php/table/types";
import { fakeNode } from "@lattice-php/core/test-support";
import { col, tableNode } from "../test-support";
import TableComponent from "./table";

function wideColumns(pinnedIndexes: Partial<Record<number, "left" | "right">> = {}) {
  return Array.from({ length: 8 }, (_, index) =>
    col({
      key: `col${index}`,
      label: `Column ${index}`,
      width: "md",
      pinned: pinnedIndexes[index] ?? null,
    }),
  );
}

function wideRow(overrides: Record<string, unknown> = {}) {
  return Object.fromEntries([
    ["id", 1],
    ...Array.from({ length: 8 }, (_, index) => [`col${index}`, `Value ${index}`]),
    ...Object.entries(overrides),
  ]);
}

const storageKey = "lattice:table-columns:workbench.products";

function node(overrides: Partial<TableNode["props"]> = {}): TableNode {
  return tableNode({
    columns: [
      col({ key: "sku", label: "SKU", width: "sm" }),
      col({ key: "name", label: "Name", width: "md" }),
    ],
    data: [{ id: 1, sku: "SKU-001", name: "Desk Lamp" }],
    ...overrides,
  });
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

  it("contains horizontal overflow inside table-grid-scroll instead of a flex ancestor", async () => {
    const wideNode = node({
      columns: Array.from({ length: 8 }, (_, index) =>
        col({ key: `col${index}`, label: `Column ${index}`, width: "md" }),
      ),
      data: [
        Object.fromEntries([
          ["id", 1],
          ...Array.from({ length: 8 }, (_, index) => [`col${index}`, `Value ${index}`]),
        ]),
      ],
    });

    const screen = await render(
      <div style={{ display: "flex", width: "600px" }}>
        <TableComponent node={wideNode} />
      </div>,
    );

    const table = screen.getByRole("table").element();
    const gridScroll = table.closest('[data-slot="table-grid-scroll"]') as HTMLElement;
    const wrapper = table.closest('[data-slot="table"]') as HTMLElement;
    const ancestor = wrapper.parentElement as HTMLElement;

    expect(ancestor.scrollWidth).toBeLessThanOrEqual(ancestor.clientWidth + 1);
    expect(gridScroll.scrollWidth).toBeGreaterThan(gridScroll.clientWidth);
  });

  it("keeps the toolbar, filter bar, and sort bar pinned instead of scrolling with the grid", async () => {
    const wideNode = node({
      columns: Array.from({ length: 8 }, (_, index) =>
        col({ key: `col${index}`, label: `Column ${index}`, width: "md" }),
      ),
      data: [
        Object.fromEntries([
          ["id", 1],
          ...Array.from({ length: 8 }, (_, index) => [`col${index}`, `Value ${index}`]),
        ]),
      ],
      searchable: true,
    });

    const screen = await render(
      <div style={{ display: "flex", width: "600px" }}>
        <TableComponent node={wideNode} />
      </div>,
    );

    const table = screen.getByRole("table").element();
    const gridScroll = table.closest('[data-slot="table-grid-scroll"]') as HTMLElement;
    const wrapper = gridScroll.closest('[data-slot="table"]') as HTMLElement;
    const toolbar = wrapper.querySelector('[data-slot="table-toolbar"]') as HTMLElement;
    const toolbarLeftBefore = toolbar.getBoundingClientRect().left;

    gridScroll.scrollLeft = gridScroll.scrollWidth;

    expect(toolbar.getBoundingClientRect().left).toBe(toolbarLeftBefore);
  });

  it("keeps table-grid-scroll as the containing block so the sr-only actions label scrolls with it instead of leaking page overflow", async () => {
    const wideNode = node({
      columns: Array.from({ length: 8 }, (_, index) =>
        col({ key: `col${index}`, label: `Column ${index}`, width: "md" }),
      ),
      data: [
        Object.fromEntries([
          ["id", 1],
          ...Array.from({ length: 8 }, (_, index) => [`col${index}`, `Value ${index}`]),
          ["actions", [{ type: "unregistered-test-action", id: "a1", props: {} }]],
        ]),
      ],
    });

    const screen = await render(
      <div style={{ display: "flex", width: "600px" }}>
        <TableComponent node={wideNode} />
      </div>,
    );

    const table = screen.getByRole("table").element();
    const gridScroll = table.closest('[data-slot="table-grid-scroll"]') as HTMLElement;
    const wrapper = table.closest('[data-slot="table"]') as HTMLElement;
    const ancestor = wrapper.parentElement as HTMLElement;

    // The sr-only actions label has no explicit position, so it falls back to
    // its static layout position within its containing block. If that
    // containing block is an ancestor outside table-grid-scroll (the actual
    // scrolling element), the label renders at a fixed page coordinate that
    // ignores scrollLeft entirely, leaking page-level horizontal overflow.
    gridScroll.scrollLeft = gridScroll.scrollWidth;

    expect(ancestor.scrollWidth).toBeLessThanOrEqual(ancestor.clientWidth + 1);
  });

  it("keeps the header background painted behind every column even though the header row's own box is narrower than its grid tracks", async () => {
    const wideNode = node({
      columns: Array.from({ length: 8 }, (_, index) =>
        col({ key: `col${index}`, label: `Column ${index}`, width: "md" }),
      ),
      data: [
        Object.fromEntries([
          ["id", 1],
          ...Array.from({ length: 8 }, (_, index) => [`col${index}`, `Value ${index}`]),
        ]),
      ],
    });

    const screen = await render(
      <div style={{ width: "400px" }}>
        <TableComponent node={wideNode} />
      </div>,
    );

    const headerRow = screen.getByRole("columnheader", { name: "Column 0" }).element()
      .parentElement as HTMLElement;
    const headerCells = Array.from(headerRow.querySelectorAll('[role="columnheader"]'));

    expect(headerCells.length).toBe(8);
    expect(headerRow.getBoundingClientRect().width).toBeLessThan(
      headerCells[headerCells.length - 1].getBoundingClientRect().right -
        headerRow.getBoundingClientRect().left,
    );

    const backgrounds = headerCells.map((cell) => getComputedStyle(cell).backgroundColor);

    expect(new Set(backgrounds).size).toBe(1);
    expect(backgrounds[0]).not.toBe("rgba(0, 0, 0, 0)");
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
    const skuHeader = screen.getByRole("columnheader", { name: "SKU", includeHidden: true });
    const headerRow = skuHeader.element().parentElement;
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
    const table = skuHeader.closest('[role="table"]');

    expect(table).toBeInstanceOf(HTMLElement);
    expect((table as HTMLElement).style.getPropertyValue("--lattice-table-columns")).toBe(
      "180px minmax(8rem, 1fr)",
    );
    await expect.element(screen.getByTestId("table-reset-columns")).toBeInTheDocument();
  });

  it("keeps stored widths for surviving columns and drops removed ones", async () => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ columns: ["sku", "ghost"], overrides: { sku: 240, ghost: 300 } }),
    );

    const screen = await render(
      <div style={{ width: "520px" }}>
        <TableComponent node={node({ resizableColumns: true })} />
      </div>,
    );
    const skuHeader = screen.getByRole("columnheader", { name: "SKU" }).element();
    const table = skuHeader.closest('[role="table"]');

    expect(table).toBeInstanceOf(HTMLElement);
    expect((table as HTMLElement).style.getPropertyValue("--lattice-table-columns")).toBe(
      "240px minmax(8rem, 1fr)",
    );
    await expect.element(screen.getByTestId("table-reset-columns")).toBeInTheDocument();
  });

  it("persists and resets resized column widths on the component", async () => {
    const screen = await render(
      <div style={{ width: "520px" }}>
        <TableComponent node={node({ resizableColumns: true })} />
      </div>,
    );
    const handle = screen.getByRole("separator", { name: "Resize SKU" });

    (handle.element() as HTMLElement).focus();
    await userEvent.keyboard("{ArrowRight}");

    await expect
      .poll(() => window.localStorage.getItem(storageKey))
      .toBe(JSON.stringify({ overrides: { sku: 136 } }));

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
    const handle = screen.getByRole("separator", { name: "Resize SKU" });
    const skuHeader = screen.getByRole("columnheader", { name: "SKU" }).element();
    const table = skuHeader.closest('[role="table"]');

    await handle.dblClick();

    await expect
      .poll(() => window.localStorage.getItem(storageKey))
      .toBe(JSON.stringify({ overrides: { name: 224 } }));
    expect(table).toBeInstanceOf(HTMLElement);
    expect((table as HTMLElement).style.getPropertyValue("--lattice-table-columns")).toBe(
      "minmax(6rem, 0.5fr) 224px",
    );
    await expect.element(screen.getByTestId("table-reset-columns")).toBeInTheDocument();
  });
});

describe("column pinning in a browser", () => {
  beforeEach(async () => {
    await page.viewport(1280, 800);
    window.localStorage.clear();
  });

  it("keeps a pinned-left column's cells fixed while unpinned columns scroll away, with an opaque background", async () => {
    const wideNode = node({
      columns: wideColumns({ 2: "left" }),
      data: [wideRow()],
    });

    const screen = await render(
      <div style={{ display: "flex", width: "600px" }}>
        <TableComponent node={wideNode} />
      </div>,
    );

    const table = screen.getByRole("table").element();
    const gridScroll = table.closest('[data-slot="table-grid-scroll"]') as HTMLElement;
    const pinnedHeader = screen.getByRole("columnheader", { name: "Column 2" }).element();
    const pinnedCell = screen.getByRole("cell", { name: "Value 2" }).element();
    const unpinnedCell = screen.getByRole("cell", { name: "Value 7" }).element();

    const pinnedHeaderLeftBefore = pinnedHeader.getBoundingClientRect().left;
    const pinnedCellLeftBefore = pinnedCell.getBoundingClientRect().left;
    const unpinnedCellLeftBefore = unpinnedCell.getBoundingClientRect().left;

    expect(getComputedStyle(pinnedCell).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");

    gridScroll.scrollLeft = gridScroll.scrollWidth;

    await expect.poll(() => pinnedHeader.getBoundingClientRect().left).toBe(pinnedHeaderLeftBefore);
    await expect.poll(() => pinnedCell.getBoundingClientRect().left).toBe(pinnedCellLeftBefore);
    expect(unpinnedCell.getBoundingClientRect().left).toBeLessThan(unpinnedCellLeftBefore);
  });

  it("keeps row actions and a pinned-right column flush to the scroll port's right edge before and after scrolling", async () => {
    const wideNode = node({
      columns: wideColumns({ 6: "right" }),
      data: [wideRow({ actions: [{ type: "unregistered-test-action", id: "a1", props: {} }] })],
    });

    const screen = await render(
      <div style={{ display: "flex", width: "600px" }}>
        <TableComponent node={wideNode} />
      </div>,
    );

    const table = screen.getByRole("table").element();
    const gridScroll = table.closest('[data-slot="table-grid-scroll"]') as HTMLElement;
    const actionsHeader = screen.getByRole("columnheader", { name: "Actions" }).element();
    const pinnedHeader = screen.getByRole("columnheader", { name: "Column 6" }).element();
    const gridScrollRight = gridScroll.getBoundingClientRect().right;

    expect(Math.abs(actionsHeader.getBoundingClientRect().right - gridScrollRight)).toBeLessThan(1);
    expect(pinnedHeader.getBoundingClientRect().right).toBeLessThanOrEqual(gridScrollRight + 0.5);

    gridScroll.scrollLeft = gridScroll.scrollWidth;

    await expect
      .poll(() => Math.abs(actionsHeader.getBoundingClientRect().right - gridScrollRight))
      .toBeLessThan(1);
    expect(pinnedHeader.getBoundingClientRect().right).toBeLessThanOrEqual(gridScrollRight + 0.5);

    gridScroll.scrollLeft = 0;

    await expect
      .poll(() => Math.abs(actionsHeader.getBoundingClientRect().right - gridScrollRight))
      .toBeLessThan(1);
  });

  it("keeps the selection checkbox column pinned to the scroll port's left edge while scrolling", async () => {
    const wideNode = node({
      columns: wideColumns({ 3: "left" }),
      data: [wideRow()],
      bulkActions: [
        fakeNode({
          type: "action",
          id: "workbench.products.archive-selected",
          props: {
            label: "Archive selected",
            method: "patch",
            endpoint: "/lattice/bulk-actions/workbench.products.archive-selected",
            ref: "sealed-ref",
          },
        }),
      ],
    });

    const screen = await render(
      <div style={{ display: "flex", width: "600px" }}>
        <TableComponent node={wideNode} />
      </div>,
    );

    const table = screen.getByRole("table").element();
    const gridScroll = table.closest('[data-slot="table-grid-scroll"]') as HTMLElement;
    const checkboxHeader = screen.getByRole("checkbox", { name: "Select all rows" }).element();
    const checkboxCell = checkboxHeader.closest('[role="columnheader"]') as HTMLElement;
    const gridScrollLeft = gridScroll.getBoundingClientRect().left;

    expect(Math.abs(checkboxCell.getBoundingClientRect().left - gridScrollLeft)).toBeLessThan(1);

    gridScroll.scrollLeft = gridScroll.scrollWidth;

    await expect
      .poll(() => Math.abs(checkboxCell.getBoundingClientRect().left - gridScrollLeft))
      .toBeLessThan(1);
  });

  it("paints the pinned header cell above columns scrolled underneath it", async () => {
    const wideNode = node({
      columns: wideColumns({ 0: "left" }),
      data: [wideRow()],
    });

    const screen = await render(
      <div style={{ display: "flex", width: "600px" }}>
        <TableComponent node={wideNode} />
      </div>,
    );

    const table = screen.getByRole("table").element();
    const gridScroll = table.closest('[data-slot="table-grid-scroll"]') as HTMLElement;
    const pinnedHeader = screen.getByRole("columnheader", { name: "Column 0" }).element();

    gridScroll.scrollLeft = gridScroll.scrollWidth;
    await expect.poll(() => gridScroll.scrollLeft).toBeGreaterThan(0);

    const rect = pinnedHeader.getBoundingClientRect();
    const point = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);

    expect(point).not.toBeNull();
    expect(pinnedHeader.contains(point)).toBe(true);
  });

  it("keeps table-grid-scroll as the containing block for pinned cells without leaking page overflow", async () => {
    const wideNode = node({
      columns: wideColumns({ 0: "left", 7: "right" }),
      data: [wideRow()],
    });

    const screen = await render(
      <div style={{ display: "flex", width: "600px" }}>
        <TableComponent node={wideNode} />
      </div>,
    );

    const table = screen.getByRole("table").element();
    const gridScroll = table.closest('[data-slot="table-grid-scroll"]') as HTMLElement;
    const wrapper = table.closest('[data-slot="table"]') as HTMLElement;
    const ancestor = wrapper.parentElement as HTMLElement;

    gridScroll.scrollLeft = gridScroll.scrollWidth;

    expect(ancestor.scrollWidth).toBeLessThanOrEqual(ancestor.clientWidth + 1);
  });

  it("shifts a later pinned-left column's position after resizing an earlier pinned-left column", async () => {
    const wideNode = node({
      columns: [
        col({ key: "a", label: "A", width: "sm", pinned: "left" }),
        col({ key: "b", label: "B", width: "sm", pinned: "left" }),
        ...Array.from({ length: 6 }, (_, index) =>
          col({ key: `col${index}`, label: `Column ${index}`, width: "md" }),
        ),
      ],
      data: [
        Object.fromEntries([
          ["id", 1],
          ["a", "A1"],
          ["b", "B1"],
          ...Array.from({ length: 6 }, (_, index) => [`col${index}`, `Value ${index}`]),
        ]),
      ],
      resizableColumns: true,
    });

    const screen = await render(
      <div style={{ display: "flex", width: "600px" }}>
        <TableComponent node={wideNode} />
      </div>,
    );

    const table = screen.getByRole("table").element();
    const gridScroll = table.closest('[data-slot="table-grid-scroll"]') as HTMLElement;
    const handle = screen.getByRole("separator", { name: "Resize A" });
    const bHeader = screen.getByRole("columnheader", { name: "B" }).element();

    gridScroll.scrollLeft = gridScroll.scrollWidth;
    const bLeftBefore = bHeader.getBoundingClientRect().left;

    (handle.element() as HTMLElement).focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");

    await expect.poll(() => bHeader.getBoundingClientRect().left).toBeGreaterThan(bLeftBefore);
  });
});
