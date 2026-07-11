import { configure, fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { beforeAll, expect, it, vi } from "vitest";

beforeAll(() => configure({ testIdAttribute: "data-test" }));

vi.mock("@lattice-php/lattice/core/renderer", () => ({
  RenderNode: ({ node }: { node: { props: { name: string } } }) => (
    <span data-test={`fld-${node.props.name}`} />
  ),
}));

import { FormProvider } from "@lattice-php/lattice/form/hooks/context";
import { FormValuesProvider } from "@lattice-php/lattice/form/hooks/values";
import { BlockInspector } from "./inspector";

// Copy the full FormProvider value shape from builder.test.tsx (see Global Constraints).
function wrap(ui: React.ReactNode) {
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
      <FormValuesProvider initial={{}}>{ui}</FormValuesProvider>
    </FormProvider>,
  );
}

const template = [{ id: "t", type: "field.text-input", props: { name: "title" } }] as never;

it("renders the block fields and commits on blur", () => {
  const onCommit = vi.fn<() => void>();

  wrap(
    <BlockInspector
      base="content"
      index={0}
      row={{ rowId: "a", type: "hero", title: "Hi" }}
      template={template}
      onField={vi.fn<(index: number, field: string, value: unknown) => void>()}
      onCommit={onCommit}
    />,
  );

  expect(screen.getByTestId("fld-title")).toBeInTheDocument();

  fireEvent.blur(screen.getByTestId("block-inspector"));
  expect(onCommit).toHaveBeenCalledOnce();
});

it("does not commit when focus moves between fields inside the inspector", () => {
  const onCommit = vi.fn<() => void>();

  wrap(
    <BlockInspector
      base="content"
      index={0}
      row={{ rowId: "a", type: "hero", title: "Hi" }}
      template={template}
      onField={vi.fn<(index: number, field: string, value: unknown) => void>()}
      onCommit={onCommit}
    />,
  );

  fireEvent.blur(screen.getByTestId("block-inspector"), {
    relatedTarget: screen.getByTestId("fld-title"),
  });

  expect(onCommit).not.toHaveBeenCalled();
});

it("shows an unknown-block note when there is no template", () => {
  wrap(
    <BlockInspector
      base="content"
      index={0}
      row={{ rowId: "a", type: "gone" }}
      onField={vi.fn<(index: number, field: string, value: unknown) => void>()}
      onCommit={vi.fn<() => void>()}
    />,
  );

  expect(screen.getByTestId("block-inspector-unknown")).toBeInTheDocument();
});
