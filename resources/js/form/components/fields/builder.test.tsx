import { expect, it, vi, beforeAll, afterAll } from "vitest";
import { configure, getConfig, fireEvent, render, screen } from "@testing-library/react";

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

import { FormProvider } from "../context";
import { FormValuesProvider } from "../values";
import { BuilderComponent } from "./builder";

const node = {
  id: "b",
  type: "form.builder",
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
      schema: [{ id: "t", type: "form.textarea", props: { name: "content" } }],
    },
    {
      type: "product",
      label: "Product line",
      schema: [{ id: "p", type: "form.text-input", props: { name: "qty" } }],
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
