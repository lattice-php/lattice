import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@lattice-php/core/renderer", async () => {
  const { RenderNode } = await import("@lattice-php/form/test/form-renderer-probe");

  return { RenderNode };
});

import { TableRows, type TableColumn } from "./table-rows";
import type { Node } from "@lattice-php/core";
import { fakeNode } from "@lattice-php/core/test-support";

const columns: TableColumn[] = [
  { name: "qty", label: "Qty", columnWidth: "md" },
  { name: "price", label: "Price", columnWidth: "md" },
];
const qtyNode = fakeNode({ id: "q", type: "field.text-input", props: { name: "qty" } });
const priceNode = fakeNode({ id: "p", type: "field.text-input", props: { name: "price" } });
const contentNode = fakeNode({ id: "c", type: "field.textarea", props: { name: "content" } });

function noop() {}

function renderRows(key: string, template: Node[], span: boolean) {
  return render(
    <TableRows
      base="items"
      columns={columns}
      rows={[{ key, index: 0, row: {}, template, span }]}
      reorderable={true}
      removable={() => true}
      onField={noop}
      onMove={noop}
      onRemove={noop}
      rowActions={null}
      onDuplicate={noop}
    />,
  );
}

it("renders the header columns once and a columnar row's scoped cells", () => {
  renderRows("a", [qtyNode, priceNode], false);

  expect(screen.getByText("Qty")).toBeInTheDocument();
  expect(screen.getByText("Price")).toBeInTheDocument();
  const children = screen.getAllByTestId("child").map((c) => c.textContent);
  expect(children).toEqual(["items[0][qty]", "items[0][price]"]);
});

it("renders a spanning row in a single full-width cell", () => {
  renderRows("b", [contentNode], true);

  expect(screen.getByTestId("table-row-items-0-span")).toBeInTheDocument();
  expect(screen.getByTestId("child").textContent).toBe("items[0][content]");
});
