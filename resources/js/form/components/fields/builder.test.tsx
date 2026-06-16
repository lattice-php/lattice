import { expect, it, vi, beforeAll, afterAll } from "vitest";
import { configure, getConfig, fireEvent, render, screen, within } from "@testing-library/react";

let prev: string;
beforeAll(() => {
  prev = getConfig().testIdAttribute;
  configure({ testIdAttribute: "data-test" });
});
afterAll(() => configure({ testIdAttribute: prev }));

const { renderCounts } = vi.hoisted(() => ({ renderCounts: new Map<string, number>() }));

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
import { BuilderComponent } from "./builder";

const node = {
  id: "b",
  type: "field.builder",
  props: {
    name: "items",
    reorderable: true,
    defaultItems: 0,
    addLabel: "Add block",
    minItems: 0,
    maxItems: 5,
  },
  blocks: [
    {
      type: "text",
      label: "Text",
      schema: [{ id: "t", type: "field.textarea", props: { name: "content" } }],
    },
    {
      type: "product",
      label: "Product line",
      schema: [{ id: "p", type: "field.text-input", props: { name: "qty" } }],
    },
  ],
} as never;

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

it("renders each row against its block template", () => {
  wrap(<BuilderComponent node={node}>{null}</BuilderComponent>, {
    items: [
      { type: "text", content: "hi" },
      { type: "product", qty: "2" },
    ],
  });
  const children = screen.getAllByTestId("child");
  expect(children.map((c) => c.textContent)).toEqual(["items[0][content]", "items[1][qty]"]);
});

it("adds a row of the chosen block type", () => {
  wrap(<BuilderComponent node={node}>{null}</BuilderComponent>);
  fireEvent.click(screen.getByTestId("builder-add"));
  fireEvent.click(screen.getByTestId("builder-add-product"));
  const children = screen.getAllByTestId("child");
  expect(children.map((c) => c.textContent)).toEqual(["items[0][qty]"]);
});

it("renders an unknown-block placeholder", () => {
  wrap(<BuilderComponent node={node}>{null}</BuilderComponent>, { items: [{ type: "video" }] });
  expect(screen.getByText(/Unknown block/i)).toBeInTheDocument();
});

it("can remove an unknown-block row", () => {
  wrap(<BuilderComponent node={node}>{null}</BuilderComponent>, {
    items: [{ type: "video" }, { type: "text", content: "keep" }],
  });
  expect(screen.getByText(/Unknown block/i)).toBeInTheDocument();
  const firstRow = screen.getByTestId("repeater-items-row-0");
  fireEvent.click(within(firstRow).getByTestId("row-action-remove"));
  expect(screen.queryByText(/Unknown block/i)).not.toBeInTheDocument();
});

it("renders the table layout: primary columns, spanning non-primary rows", () => {
  const node = {
    id: "b",
    type: "field.builder",
    props: {
      name: "items",
      layout: "table",
      reorderable: true,
      defaultItems: 0,
      addLabel: "Add block",
      minItems: 0,
      maxItems: 9,
    },
    blocks: [
      {
        type: "product",
        label: "Product",
        schema: [
          { id: "p", type: "field.text-input", props: { name: "product", label: "Product" } },
          { id: "q", type: "field.text-input", props: { name: "qty", label: "Qty" } },
        ],
      },
      {
        type: "text",
        label: "Text",
        schema: [{ id: "c", type: "field.textarea", props: { name: "content", label: "Content" } }],
      },
    ],
  } as never;
  wrap(<BuilderComponent node={node}>{null}</BuilderComponent>, {
    items: [
      { type: "product", product: "SKU", qty: "2" },
      { type: "text", content: "note" },
    ],
  });
  expect(screen.getByText("Product")).toBeInTheDocument();
  expect(screen.getByText("Qty")).toBeInTheDocument();
  const texts = screen.getAllByTestId("child").map((c) => c.textContent);
  expect(texts).toContain("items[0][product]");
  expect(texts).toContain("items[0][qty]");
  expect(texts).toContain("items[1][content]");
  expect(screen.getByTestId("table-row-items-1-span")).toBeInTheDocument();
});

it("does not re-render sibling rows when one row changes", () => {
  wrap(<BuilderComponent node={node}>{null}</BuilderComponent>, {
    items: [
      { type: "product", qty: "1" },
      { type: "product", qty: "2" },
    ],
  });
  renderCounts.clear();
  fireEvent.click(screen.getByTestId("commit-items[0][qty]"));
  expect(renderCounts.get("items[0][qty]") ?? 0).toBeGreaterThanOrEqual(1);
  expect(renderCounts.get("items[1][qty]") ?? 0).toBe(0);
});
