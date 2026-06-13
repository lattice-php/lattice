import { expect, it, vi, beforeAll, afterAll } from "vitest";
import { configure, getConfig, render, screen } from "@testing-library/react";

let prev: string;
beforeAll(() => {
  prev = getConfig().testIdAttribute;
  configure({ testIdAttribute: "data-test" });
});
afterAll(() => configure({ testIdAttribute: prev }));

vi.mock("@lattice/lattice/core/renderer", async () => {
  const { useFieldScope } = await import("../field-scope");
  return {
    RenderNode: ({ node }: { node: { props: { name: string } } }) => {
      const scope = useFieldScope();
      return (
        <span data-test="child">{scope ? scope.scopedName(node.props.name) : "no-scope"}</span>
      );
    },
  };
});

import { TableRows } from "./table-rows";

const columns = [
  { name: "qty", label: "Qty" },
  { name: "price", label: "Price" },
];
const qtyNode = { id: "q", type: "form.text-input", props: { name: "qty" } } as never;
const priceNode = { id: "p", type: "form.text-input", props: { name: "price" } } as never;
const contentNode = { id: "c", type: "form.textarea", props: { name: "content" } } as never;

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
    />,
  );
  expect(screen.getByTestId("table-row-items-0-span")).toBeInTheDocument();
  expect(screen.getByTestId("child").textContent).toBe("items[0][content]");
});

it("shows a remove action when removable", () => {
  render(
    <TableRows
      base="items"
      columns={columns}
      rows={[{ key: "a", index: 0, row: {}, template: [qtyNode], span: false }]}
      reorderable={true}
      removable={() => true}
      onField={noop}
      onMove={noop}
      onRemove={noop}
    />,
  );
  expect(screen.getByTestId("row-action-remove")).toBeInTheDocument();
});
