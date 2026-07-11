import { configure, fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";

beforeAll(() => configure({ testIdAttribute: "data-test" }));

vi.mock("@lattice-php/lattice/core/renderer", () => ({
  Renderer: ({ nodes }: { nodes: { props?: { text?: string } }[] }) => (
    <span>{nodes[0]?.props?.text ?? ""}</span>
  ),
  RenderNode: () => <span data-test="field-node" />,
}));
vi.mock("@lattice-php/lattice/core/api", () => ({
  apiJson: vi.fn<(...args: unknown[]) => Promise<unknown>>().mockResolvedValue({ wire: [] }),
}));

import type React from "react";
import { FormProvider } from "@lattice-php/lattice/form/hooks/context";
import { FormValuesProvider } from "@lattice-php/lattice/form/hooks/values";
import { BlockEditorComponent } from "./index";

function wrap(
  ui: React.ReactNode,
  initial: Record<string, unknown>,
  errors: Record<string, string | undefined> = {},
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

const baseNode = {
  id: "content",
  type: "field.block-editor",
  props: { name: "content", ref: "sealed", endpoint: "/lattice/blocks/render", defaultItems: 0 },
  templates: [
    {
      type: "hero",
      label: "Hero",
      schema: [{ id: "t", type: "field.text-input", props: { name: "title" } }],
    },
    { type: "columns", label: "Columns", schema: [], slots: ["main"] },
  ],
  rendered: [{ wire: [{ type: "heading", props: { text: "Stored" } }], slots: {} }],
};
const node = baseNode as never;

it("renders stored blocks on the canvas from the rendered prop", () => {
  wrap(<BlockEditorComponent node={node}>{null}</BlockEditorComponent>, {
    content: [{ rowId: "a", type: "hero", title: "Stored" }],
  });

  expect(screen.getByText("Stored")).toBeInTheDocument();
  expect(screen.getByTestId("block-shell-a")).toBeInTheDocument();
});

it("renders nothing when its visible condition fails", () => {
  const hiddenNode = {
    ...baseNode,
    props: {
      ...baseNode.props,
      conditions: { visible: [{ field: "status", operator: "eq", value: "live" }] },
    },
  } as never;

  wrap(<BlockEditorComponent node={hiddenNode}>{null}</BlockEditorComponent>, {
    content: [{ rowId: "a", type: "hero", title: "Stored" }],
  });

  expect(screen.queryByTestId("block-editor-inspector")).not.toBeInTheDocument();
});

it("shows the field error from the form context", () => {
  wrap(
    <BlockEditorComponent node={node}>{null}</BlockEditorComponent>,
    { content: [{ rowId: "a", type: "hero", title: "Stored" }] },
    { content: "At least one block is required." },
  );

  expect(screen.getByText("At least one block is required.")).toBeInTheDocument();
});

const slottedValue = () => ({
  content: [
    {
      rowId: "c1",
      type: "columns",
      slots: { main: [{ rowId: "h1", type: "hero", title: "Inner" }] },
    },
  ],
});

const slottedNode = {
  ...baseNode,
  rendered: [
    {
      wire: [{ type: "grid", props: {} }],
      slots: { main: [{ wire: [{ type: "heading", props: { text: "Inner" } }], slots: {} }] },
    },
  ],
} as never;

it("renders slot children as their own shells with nested key inputs", () => {
  const { container } = wrap(
    <BlockEditorComponent node={slottedNode}>{null}</BlockEditorComponent>,
    slottedValue(),
  );

  expect(screen.getByTestId("block-slot-main")).toBeInTheDocument();
  expect(screen.getByTestId("block-shell-h1")).toBeInTheDocument();
  expect(screen.getByText("Inner")).toBeInTheDocument();

  const typeInput = container.querySelector('input[name="content[0][slots][main][0][type]"]');
  const rowIdInput = container.querySelector('input[name="content[0][slots][main][0][rowId]"]');
  expect(typeInput).toHaveValue("hero");
  expect(rowIdInput).toHaveValue("h1");
});

it("selects a nested child without selecting its parent", () => {
  wrap(<BlockEditorComponent node={slottedNode}>{null}</BlockEditorComponent>, slottedValue());

  fireEvent.click(screen.getByTestId("block-shell-h1"));

  expect(screen.getByTestId("block-shell-h1")).toHaveAttribute("aria-selected", "true");
  expect(screen.getByTestId("block-shell-c1")).toHaveAttribute("aria-selected", "false");
});

it("removes a nested block from the value", () => {
  const { container } = wrap(
    <BlockEditorComponent node={slottedNode}>{null}</BlockEditorComponent>,
    slottedValue(),
  );

  fireEvent.click(screen.getByTestId("block-remove-h1"));

  expect(screen.queryByTestId("block-shell-h1")).not.toBeInTheDocument();
  expect(screen.getByText("Drop blocks here")).toBeInTheDocument();
  expect(
    container.querySelector('input[name="content[0][slots][main][0][type]"]'),
  ).not.toBeInTheDocument();
});
