import { expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";

vi.mock("@lattice-php/lattice/core/renderer", async () => {
  const { RenderNode } = await import("@lattice-php/lattice/test/form-renderer-probe");

  return { RenderNode };
});

import { FormProvider } from "@lattice-php/lattice/form/hooks/context";
import { FormValuesProvider } from "@lattice-php/lattice/form/hooks/values";
import { renderCounts } from "@lattice-php/lattice/test/form-renderer-probe";
import { RepeaterComponent } from "./repeater";
import { fakeNode } from "@lattice-php/lattice/test-support";

const repeaterNode = fakeNode({
  id: "r",
  type: "field.repeater",
  props: {
    name: "items",
    reorderable: true,
    defaultItems: 1,
    addLabel: "Add line",
    minItems: 0,
    maxItems: 3,
    label: "Line items",
  },
  schema: [{ id: "c", type: "field.text-input", props: { name: "name", label: "Name" } }],
});

function wrap(
  ui: React.ReactNode,
  initial: Record<string, unknown> = {},
  errors: Record<string, string> = {},
) {
  return render(
    <FormProvider
      value={{
        action: "#",
        clearErrors: () => {},
        componentRef: "",
        errors,
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

it("renders defaultItems rows, each scoping its children", () => {
  wrap(<RepeaterComponent node={repeaterNode}>{null}</RepeaterComponent>);
  const children = screen.getAllByTestId("child");
  expect(children).toHaveLength(1);
  expect(children[0].textContent).toBe("items[0][name]");
});

it("adds a row up to maxItems", () => {
  wrap(<RepeaterComponent node={repeaterNode}>{null}</RepeaterComponent>);
  fireEvent.click(screen.getByTestId("repeater-items-add"));
  const children = screen.getAllByTestId("child");
  expect(children.map((c) => c.textContent)).toEqual(["items[0][name]", "items[1][name]"]);
});

it("removes a row", () => {
  wrap(<RepeaterComponent node={repeaterNode}>{null}</RepeaterComponent>, {
    items: [{ name: "a" }, { name: "b" }],
  });
  expect(screen.getAllByTestId("child")).toHaveLength(2);
  const firstRow = screen.getByTestId("repeater-items-row-0");
  fireEvent.click(within(firstRow).getByTestId("row-action-remove"));
  expect(screen.getAllByTestId("child")).toHaveLength(1);
});

it("renders declared row actions in a kebab and duplicates a row", () => {
  const node = fakeNode({
    id: "r",
    type: "field.repeater",
    props: {
      name: "items",
      reorderable: true,
      defaultItems: 1,
      minItems: 0,
      maxItems: 3,
      label: "Line items",
      rowActions: [
        { type: "duplicate", key: "duplicate", label: null, icon: null, destructive: false },
        { type: "remove", key: "remove", label: null, icon: null, destructive: true },
      ],
    },
    schema: [{ id: "c", type: "field.text-input", props: { name: "name", label: "Name" } }],
  });

  wrap(<RepeaterComponent node={node}>{null}</RepeaterComponent>, {
    items: [{ name: "a" }],
  });

  expect(screen.getAllByTestId("child")).toHaveLength(1);

  const firstRow = screen.getByTestId("repeater-items-row-0");
  fireEvent.click(within(firstRow).getByTestId("row-actions-menu"));
  fireEvent.click(screen.getByTestId("row-action-duplicate"));

  expect(screen.getAllByTestId("child")).toHaveLength(2);
});

it("shows the array-level error for the repeater field", () => {
  wrap(
    <RepeaterComponent node={repeaterNode}>{null}</RepeaterComponent>,
    {},
    { items: "Must have at least 1 item" },
  );
  expect(screen.getByText("Must have at least 1 item")).toBeInTheDocument();
});

it("renders the table layout with a header from the schema", () => {
  const node = fakeNode({
    id: "r",
    type: "field.repeater",
    props: {
      name: "items",
      layout: "table",
      reorderable: true,
      defaultItems: 0,
      minItems: 0,
      maxItems: 5,
      addLabel: "Add",
    },
    schema: [
      { id: "q", type: "field.text-input", props: { name: "qty", label: "Qty" } },
      { id: "p", type: "field.text-input", props: { name: "price", label: "Price" } },
    ],
  });
  wrap(<RepeaterComponent node={node}>{null}</RepeaterComponent>, {
    items: [{ qty: "1", price: "2" }],
  });
  expect(screen.getByText("Qty")).toBeInTheDocument();
  expect(screen.getByText("Price")).toBeInTheDocument();
  const children = screen.getAllByTestId("child").map((c) => c.textContent);
  expect(children).toEqual(["items[0][qty]", "items[0][price]"]);
});

it("does not re-render sibling rows when one row changes", () => {
  wrap(<RepeaterComponent node={repeaterNode}>{null}</RepeaterComponent>, {
    items: [{ name: "a" }, { name: "b" }],
  });

  renderCounts.clear();
  fireEvent.click(screen.getByTestId("commit-items[0][name]"));

  expect(renderCounts.get("items[0][name]") ?? 0).toBeGreaterThanOrEqual(1);
  expect(renderCounts.get("items[1][name]") ?? 0).toBe(0);
});
