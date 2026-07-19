import { expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentPropsOf, Node } from "@lattice-php/lattice/core/types";
import { fakeNode } from "@lattice-php/lattice/test-support";

vi.mock("@lattice-php/lattice/core/renderer", async () => {
  const { RenderNode } = await import("@lattice-php/lattice/test/form-renderer-probe");

  return { RenderNode };
});

import { FormProvider } from "@lattice-php/lattice/form/hooks/context";
import { FormValuesProvider } from "@lattice-php/lattice/form/hooks/values";
import { renderCounts } from "@lattice-php/lattice/test/form-renderer-probe";
import { BuilderComponent } from "./builder";
import type { RowTemplate } from "./row-templates";

function builderNode(
  props: Partial<ComponentPropsOf<"field.builder">>,
  templates: RowTemplate[],
): Node<"field.builder"> & { templates: RowTemplate[] } {
  return { ...fakeNode({ type: "field.builder", props }), templates };
}

const node = builderNode(
  {
    name: "items",
    reorderable: true,
    defaultItems: 0,
    addLabel: "Add block",
    minItems: 0,
    maxItems: 5,
  },
  [
    {
      type: "text",
      label: "Text",
      schema: [fakeNode({ id: "t", type: "field.textarea", props: { name: "content" } })],
    },
    {
      type: "product",
      label: "Product line",
      schema: [fakeNode({ id: "p", type: "field.text-input", props: { name: "qty" } })],
    },
  ],
);

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
  const node = builderNode(
    {
      name: "items",
      layout: "table",
      reorderable: true,
      defaultItems: 0,
      addLabel: "Add block",
      minItems: 0,
      maxItems: 9,
    },
    [
      {
        type: "product",
        label: "Product",
        schema: [
          fakeNode({
            id: "p",
            type: "field.text-input",
            props: { name: "product", label: "Product" },
          }),
          fakeNode({ id: "q", type: "field.text-input", props: { name: "qty", label: "Qty" } }),
        ],
      },
      {
        type: "text",
        label: "Text",
        schema: [
          fakeNode({
            id: "c",
            type: "field.textarea",
            props: { name: "content", label: "Content" },
          }),
        ],
      },
    ],
  );
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
