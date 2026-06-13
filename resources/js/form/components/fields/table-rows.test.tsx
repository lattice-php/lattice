import { expect, it, vi, beforeAll, afterAll } from "vitest";
import { configure, fireEvent, getConfig, render, screen } from "@testing-library/react";

let prev: string;
beforeAll(() => {
  prev = getConfig().testIdAttribute;
  configure({ testIdAttribute: "data-test" });
});
afterAll(() => configure({ testIdAttribute: prev }));

const { renderCounts } = vi.hoisted(() => ({ renderCounts: new Map<string, number>() }));

vi.mock("@lattice/lattice/core/renderer", async () => {
  const { useFieldScope } = await import("../field-scope");
  return {
    RenderNode: ({ node }: { node: { props: { name: string } } }) => {
      const scope = useFieldScope();
      const key = scope ? scope.scopedName(node.props.name) : "no-scope";
      renderCounts.set(key, (renderCounts.get(key) ?? 0) + 1);
      return (
        <>
          <span data-test="child">{key}</span>
          <button
            aria-label={`commit ${key}`}
            data-test={`commit-${key}`}
            type="button"
            onClick={() => scope?.setValue(node.props.name, "x")}
          />
        </>
      );
    },
  };
});

import { FormProvider } from "../context";
import { FormValuesProvider } from "../values";
import { RepeaterComponent } from "./repeater";
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

it("registers each row element for FLIP", () => {
  const calls: Array<[string, HTMLElement | null]> = [];
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
      registerRow={(k, el) => calls.push([k, el])}
    />,
  );
  expect(calls.some(([k, el]) => k === "a" && el !== null)).toBe(true);
});

function wrap(ui: React.ReactNode, initial: Record<string, unknown> = {}) {
  return render(
    <FormProvider
      value={{
        action: "#",
        clearErrors: () => {},
        componentRef: "",
        errors: {},
        fieldLabels: {},
        precognitive: false,
        processing: false,
        validate: () => {},
      }}
    >
      <FormValuesProvider initial={initial}>{ui}</FormValuesProvider>
    </FormProvider>,
  );
}

const tableNode = {
  id: "r",
  type: "form.repeater",
  props: {
    name: "items",
    layout: "table",
    reorderable: true,
    defaultItems: 0,
    minItems: 0,
    maxItems: 5,
  },
  schema: [{ id: "q", type: "form.text-input", props: { name: "qty", label: "Qty" } }],
} as never;

it("does not re-render sibling table rows when one row changes", () => {
  wrap(<RepeaterComponent node={tableNode}>{null}</RepeaterComponent>, {
    items: [{ qty: "1" }, { qty: "2" }],
  });

  renderCounts.clear();
  fireEvent.click(screen.getByTestId("commit-items[0][qty]"));

  expect(renderCounts.get("items[0][qty]") ?? 0).toBeGreaterThanOrEqual(1);
  expect(renderCounts.get("items[1][qty]") ?? 0).toBe(0);
});
