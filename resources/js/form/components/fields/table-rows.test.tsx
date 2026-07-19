import { afterEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

afterEach(() => {
  window.localStorage.clear();
});

vi.mock("@lattice-php/lattice/core/renderer", async () => {
  const { RenderNode } = await import("@lattice-php/lattice/test/form-renderer-probe");

  return { RenderNode };
});

import { FormProvider } from "@lattice-php/lattice/form/hooks/context";
import { FormValuesProvider } from "@lattice-php/lattice/form/hooks/values";
import { renderCounts } from "@lattice-php/lattice/test/form-renderer-probe";
import { RepeaterComponent } from "./repeater";
import { TableRows, type TableColumn } from "./table-rows";
import { fakeNode } from "@lattice-php/lattice/test-support";

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

type MediaQueryListener = (this: MediaQueryList, event: MediaQueryListEvent) => void;

function mockTableViewport(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn<(query: string) => MediaQueryList>().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject | null) => void>(),
      removeEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject | null) => void>(),
      addListener: vi.fn<(listener: MediaQueryListener | null) => void>(),
      removeListener: vi.fn<(listener: MediaQueryListener | null) => void>(),
      dispatchEvent: vi.fn<(event: Event) => boolean>(() => true),
    })),
  );
}

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
      rowActions={null}
      onDuplicate={noop}
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
      rowActions={null}
      onDuplicate={noop}
      registerRow={(k, el) => calls.push([k, el])}
    />,
  );
  expect(calls.some(([k, el]) => k === "a" && el !== null)).toBe(true);
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

it("stores table layout column widths under the field base", () => {
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

  const handle = screen.getByRole("separator", { name: "Resize Qty" });

  fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
  fireEvent.pointerMove(handle, { clientX: 180, pointerId: 1 });

  expect(window.localStorage.getItem("lattice:table-columns:form:items")).toBeNull();

  fireEvent.pointerUp(handle, { clientX: 180, pointerId: 1 });

  expect(JSON.parse(window.localStorage.getItem("lattice:table-columns:form:items") ?? "")).toEqual(
    {
      columns: ["qty", "price"],
      overrides: {
        qty: 256,
      },
    },
  );
});

it("renders stack rows instead of the horizontal table below the table breakpoint", () => {
  mockTableViewport(false);

  render(
    <TableRows
      base="items"
      columns={columns}
      rows={[
        { key: "a", index: 0, row: {}, template: [qtyNode, priceNode], span: false, heading: "#1" },
      ]}
      reorderable={true}
      removable={() => true}
      onField={noop}
      onMove={noop}
      onRemove={noop}
      rowActions={null}
      onDuplicate={noop}
    />,
  );

  expect(screen.getByTestId("repeater-items-row-0")).toBeInTheDocument();
  expect(screen.queryByTestId("table-row-items-0")).not.toBeInTheDocument();
  expect(screen.getAllByTestId("child").map((child) => child.textContent)).toEqual([
    "items[0][qty]",
    "items[0][price]",
  ]);
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

const tableNode = fakeNode({
  id: "r",
  type: "field.repeater",
  props: {
    name: "items",
    layout: "table",
    reorderable: true,
    defaultItems: 0,
    minItems: 0,
    maxItems: 5,
  },
  schema: [
    { id: "q", type: "field.text-input", props: { name: "qty", label: "Qty", columnWidth: "md" } },
  ],
});

it("does not re-render sibling table rows when one row changes", () => {
  wrap(<RepeaterComponent node={tableNode}>{null}</RepeaterComponent>, {
    items: [{ qty: "1" }, { qty: "2" }],
  });

  renderCounts.clear();
  fireEvent.click(screen.getByTestId("commit-items[0][qty]"));

  expect(renderCounts.get("items[0][qty]") ?? 0).toBeGreaterThanOrEqual(1);
  expect(renderCounts.get("items[1][qty]") ?? 0).toBe(0);
});
