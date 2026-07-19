import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { FieldScopeProvider } from "./field-scope";
import { ResolvedNodesProvider, useResolvedNode } from "./resolved-nodes";

function Probe({ node }: { node: Node }) {
  const resolved = useResolvedNode(node);
  return <span>{String((resolved.props as { value?: unknown })?.value)}</span>;
}

describe("ResolvedNodes", () => {
  it("overrides a node by name", () => {
    const original = fakeNode({
      type: "field.text-input",
      props: { name: "total", value: "0" },
    });
    render(
      <ResolvedNodesProvider
        nodes={{
          total: fakeNode({
            type: "field.text-input",
            props: { name: "total", value: "12" },
          }),
        }}
      >
        <Probe node={original} />
      </ResolvedNodesProvider>,
    );
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("falls back to the original node", () => {
    const original = fakeNode({
      type: "field.text-input",
      props: { name: "total", value: "0" },
    });
    render(
      <ResolvedNodesProvider nodes={{}}>
        <Probe node={original} />
      </ResolvedNodesProvider>,
    );
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("overrides a scoped node by full path", () => {
    const original = fakeNode({
      type: "field.text-input",
      props: { name: "price", value: "0" },
    });

    render(
      <ResolvedNodesProvider
        nodes={{
          "items.0.price": fakeNode({
            type: "field.text-input",
            props: { name: "price", value: "12" },
          }),
        }}
      >
        <FieldScopeProvider
          base="items"
          index={0}
          row={{ rowId: "r1", price: "0" }}
          onChange={() => {}}
        >
          <Probe node={original} />
        </FieldScopeProvider>
      </ResolvedNodesProvider>,
    );

    expect(screen.getByText("12")).toBeInTheDocument();
  });
});
