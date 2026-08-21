import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { TableRows, type TableColumn } from "./table-rows";

vi.mock("@lattice-php/core/renderer", async () => {
  const { RenderNode } = await import("@lattice-php/form/test/form-renderer-probe");

  return { RenderNode };
});

const columns: TableColumn[] = [
  { name: "qty", label: "Qty", columnWidth: "md" },
  { name: "price", label: "Price", columnWidth: "md" },
];
const qtyNode = fakeNode({ id: "q", type: "field.text-input", props: { name: "qty" } });
const priceNode = fakeNode({ id: "p", type: "field.text-input", props: { name: "price" } });

function noop() {}

function renderRows(resizableColumns = false) {
  return render(
    <TableRows
      base="items"
      columns={columns}
      rows={[
        { key: "a", index: 0, row: {}, template: [qtyNode, priceNode], span: false, heading: "#1" },
      ]}
      reorderable={true}
      removable={() => true}
      resizableColumns={resizableColumns}
      onField={noop}
      onMove={noop}
      onRemove={noop}
      rowActions={null}
      onDuplicate={noop}
    />,
  );
}

describe("TableRows in a browser", () => {
  beforeEach(async () => {
    await page.viewport(1280, 800);
    window.localStorage.clear();
  });

  it("stores dragged column widths under the field base", async () => {
    const screen = await renderRows(true);
    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    await userEvent.dragAndDrop(handle, screen.getByText("Price"));

    await expect
      .poll(() => {
        const stored = window.localStorage.getItem("lattice:table-columns:form:items");

        return stored
          ? (JSON.parse(stored) as { overrides: Record<string, number> }).overrides.qty
          : null;
      })
      .toBeGreaterThan(0);
  });

  it("renders stack rows instead of the horizontal table below the table breakpoint", async () => {
    await page.viewport(390, 800);

    const screen = await renderRows();

    await expect.element(screen.getByTestId("repeater-items-row-0")).toBeInTheDocument();
    await expect.element(page.getByTestId("table-row-items-0")).not.toBeInTheDocument();
    await expect
      .poll(() =>
        Array.from(document.querySelectorAll('[data-test="child"]')).map(
          (child) => child.textContent,
        ),
      )
      .toEqual(["items[0][qty]", "items[0][price]"]);
  });
});
