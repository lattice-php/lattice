import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@lattice-php/core/renderer", async () => {
  const { RenderNode } = await import("@lattice-php/form/test/form-renderer-probe");

  return { RenderNode };
});

import { TableRows, type TableColumn } from "./table-rows";
import { fakeNode } from "@lattice-php/core/test-support";

const columns: TableColumn[] = [
  { name: "qty", label: "Qty", columnWidth: "md" },
  { name: "price", label: "Price", columnWidth: "md" },
];
const sizedColumns: TableColumn[] = [
  { name: "qty", label: "Qty", columnWidth: "xs" },
  { name: "description", label: "Description", columnWidth: "xl" },
];
const qtyNode = fakeNode({ id: "q", type: "field.text-input", props: { name: "qty" } });
const priceNode = fakeNode({ id: "p", type: "field.text-input", props: { name: "price" } });
const contentNode = fakeNode({ id: "c", type: "field.textarea", props: { name: "content" } });

function noop() {}

it("renders the header columns once and a columnar row's scoped cells", () => {
  render(
    <TableRows
      base="items"
      columns={columns}
      rows={[{ key: "a", index: 0, row: {}, template: [qtyNode, priceNode], span: false }]}
      reorderable={true}
      removable={() => true}
      onField={noop}
      onMove={noop}
      onRemove={noop}
      rowActions={null}
      onDuplicate={noop}
    />,
  );
  expect(screen.getByText("Qty")).toBeInTheDocument();
  expect(screen.getByText("Price")).toBeInTheDocument();
  const children = screen.getAllByTestId("child").map((c) => c.textContent);
  expect(children).toEqual(["items[0][qty]", "items[0][price]"]);
});

it("renders a spanning row in a single full-width cell", () => {
  render(
    <TableRows
      base="items"
      columns={columns}
      rows={[{ key: "b", index: 0, row: {}, template: [contentNode], span: true }]}
      reorderable={true}
      removable={() => true}
      onField={noop}
      onMove={noop}
      onRemove={noop}
      rowActions={null}
      onDuplicate={noop}
    />,
  );
  expect(screen.getByTestId("table-row-items-0-span")).toBeInTheDocument();
  expect(screen.getByTestId("child").textContent).toBe("items[0][content]");
});

it("uses column width hints when building the table grid", () => {
  render(
    <TableRows
      base="items"
      columns={sizedColumns}
      rows={[{ key: "a", index: 0, row: {}, template: [qtyNode, priceNode], span: false }]}
      reorderable={true}
      removable={() => true}
      onField={noop}
      onMove={noop}
      onRemove={noop}
      rowActions={null}
      onDuplicate={noop}
    />,
  );

  expect(screen.getByText("Qty").parentElement?.parentElement).toHaveStyle(
    "--lattice-table-columns: 3rem minmax(4rem, 0.35fr) minmax(16rem, 2fr) 3rem",
  );
});

it("does not render column resize handles unless enabled", () => {
  render(
    <TableRows
      base="items"
      columns={columns}
      rows={[{ key: "a", index: 0, row: {}, template: [qtyNode, priceNode], span: false }]}
      reorderable={true}
      removable={() => true}
      onField={noop}
      onMove={noop}
      onRemove={noop}
      rowActions={null}
      onDuplicate={noop}
    />,
  );

  expect(screen.queryByRole("separator", { name: "Resize Qty" })).not.toBeInTheDocument();
});

it("renders column resize handles when enabled", () => {
  render(
    <TableRows
      base="items"
      columns={columns}
      rows={[{ key: "a", index: 0, row: {}, template: [qtyNode, priceNode], span: false }]}
      reorderable={true}
      removable={() => true}
      resizableColumns={true}
      onField={noop}
      onMove={noop}
      onRemove={noop}
      rowActions={null}
      onDuplicate={noop}
    />,
  );

  expect(screen.getByRole("separator", { name: "Resize Qty" })).toBeInTheDocument();
});
