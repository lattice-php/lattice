import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import { FieldScopeProvider } from "./field-scope";
import { ResolvedNodesProvider, useResolvedNode } from "./resolved-nodes";

function Probe({ node }: { node: Node }) {
  const resolved = useResolvedNode(node);
  return <span>{String((resolved.props as { value?: unknown })?.value)}</span>;
}

describe("ResolvedNodes", () => {
  it("overrides a node by name", () => {
    const original = { type: "field.text-input", props: { name: "total", value: "0" } } as Node;
    render(
      <ResolvedNodesProvider
        nodes={{
          total: { type: "field.text-input", props: { name: "total", value: "12" } } as Node,
        }}
      >
        <Probe node={original} />
      </ResolvedNodesProvider>,
    );
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("falls back to the original node", () => {
    const original = { type: "field.text-input", props: { name: "total", value: "0" } } as Node;
    render(
      <ResolvedNodesProvider nodes={{}}>
        <Probe node={original} />
      </ResolvedNodesProvider>,
    );
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("overrides a scoped node by full path", () => {
    const original = { type: "field.text-input", props: { name: "price", value: "0" } } as Node;

    render(
      <ResolvedNodesProvider
        nodes={{
          "items.0.price": {
            type: "field.text-input",
            props: { name: "price", value: "12" },
          } as Node,
        }}
      >
        <FieldScopeProvider
          base="items"
          index={0}
          row={{ __rowId: "r1", price: "0" }}
          onChange={() => {}}
        >
          <Probe node={original} />
        </FieldScopeProvider>
      </ResolvedNodesProvider>,
    );

    expect(screen.getByText("12")).toBeInTheDocument();
  });
});
