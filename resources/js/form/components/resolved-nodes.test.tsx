import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice/core/types";
import { ResolvedNodesProvider, useResolvedNode } from "./resolved-nodes";

function Probe({ node }: { node: Node }) {
  const resolved = useResolvedNode(node);
  return <span>{String((resolved.props as { value?: unknown })?.value)}</span>;
}

describe("ResolvedNodes", () => {
  it("overrides a node by name", () => {
    const original = { type: "form.text-input", props: { name: "total", value: "0" } } as Node;
    render(
      <ResolvedNodesProvider
        nodes={{
          total: { type: "form.text-input", props: { name: "total", value: "12" } } as Node,
        }}
      >
        <Probe node={original} />
      </ResolvedNodesProvider>,
    );
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("falls back to the original node", () => {
    const original = { type: "form.text-input", props: { name: "total", value: "0" } } as Node;
    render(
      <ResolvedNodesProvider nodes={{}}>
        <Probe node={original} />
      </ResolvedNodesProvider>,
    );
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
