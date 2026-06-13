import { expect, it, vi, beforeAll, afterAll } from "vitest";
import { configure, getConfig, fireEvent, render, screen, within } from "@testing-library/react";

// The form convention is data-test; scope the RTL testIdAttribute to this file only.
let prevTestIdAttribute: string;
beforeAll(() => {
  prevTestIdAttribute = getConfig().testIdAttribute;
  configure({ testIdAttribute: "data-test" });
});
afterAll(() => {
  configure({ testIdAttribute: prevTestIdAttribute });
});

// Per-scoped-key render counter, shared with the mock factory below.
const { renderCounts } = vi.hoisted(() => ({ renderCounts: new Map<string, number>() }));

// Mock the child-node renderer so the test doesn't need the full registry.
// The stub reads the FieldScope to prove each row scopes its children, counts
// its own renders, and exposes a button that commits a value into its row.
vi.mock("@lattice-php/lattice/core/renderer", async () => {
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

const repeaterNode = {
  id: "r",
  type: "form.repeater",
  props: {
    name: "items",
    reorderable: true,
    defaultItems: 1,
    addLabel: "Add line",
    minItems: 0,
    maxItems: 3,
    label: "Line items",
  },
  schema: [{ id: "c", type: "form.text-input", props: { name: "name", label: "Name" } }],
} as never;

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
  const node = {
    id: "r",
    type: "form.repeater",
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
    schema: [{ id: "c", type: "form.text-input", props: { name: "name", label: "Name" } }],
  } as never;

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
  const node = {
    id: "r",
    type: "form.repeater",
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
      { id: "q", type: "form.text-input", props: { name: "qty", label: "Qty" } },
      { id: "p", type: "form.text-input", props: { name: "price", label: "Price" } },
    ],
  } as never;
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
