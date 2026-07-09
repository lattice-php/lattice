import { configure, render, screen } from "@testing-library/react";
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
import { FormProvider } from "../../context";
import { FormValuesProvider } from "../../values";
import { BlockEditorComponent } from "./index";

function wrap(ui: React.ReactNode, initial: Record<string, unknown>) {
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

const node = {
  id: "content",
  type: "field.block-editor",
  props: { name: "content", ref: "sealed", endpoint: "/lattice/blocks/render", defaultItems: 0 },
  blocks: [
    {
      type: "hero",
      label: "Hero",
      schema: [{ id: "t", type: "field.text-input", props: { name: "title" } }],
    },
  ],
  rendered: [[{ type: "heading", props: { text: "Stored" } }]],
} as never;

it("renders stored blocks on the canvas from the rendered prop", () => {
  wrap(<BlockEditorComponent node={node}>{null}</BlockEditorComponent>, {
    content: [{ __rowId: "a", type: "hero", title: "Stored" }],
  });

  expect(screen.getByText("Stored")).toBeInTheDocument();
  expect(screen.getByTestId("block-shell-a")).toBeInTheDocument();
});
