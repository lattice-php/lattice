import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent, lazyComponent } from "@/lattice";
import { LatticeRenderer } from "@/lattice";
import type { RendererComponent, RendererComponentModule } from "./types";

const TestComponent: RendererComponent<"test.component"> = ({ children, node }) => (
  <section data-testid={node.id}>{children}</section>
);

describe("LatticeRenderer", () => {
  it("renders registered components recursively", () => {
    const registry = createRegistry({
      components: {
        "test.component": eagerComponent(TestComponent),
      },
      name: "test",
    });

    render(
      <LatticeRenderer
        nodes={[
          {
            children: [
              {
                id: "child",
                type: "test.component",
              },
            ],
            id: "parent",
            type: "test.component",
          },
        ]}
        registry={registry}
      />,
    );

    expect(screen.getByTestId("parent")).toContainElement(screen.getByTestId("child"));
  });

  it("renders the configured missing component fallback", () => {
    render(
      <LatticeRenderer
        missingComponent={({ node }) => <span>Missing {node.type}</span>}
        nodes={[
          {
            type: "unknown.component",
          },
        ]}
        registry={{}}
      />,
    );

    expect(screen.getByText("Missing unknown.component")).toBeVisible();
  });

  it("renders a lazy component fallback while the chunk is loading", () => {
    const LazyFallback: RendererComponent<"test.lazy"> = ({ node }) => (
      <div data-testid={`${node.id}-fallback`} />
    );

    const registry = createRegistry({
      components: {
        "test.lazy": lazyComponent(
          () => new Promise<RendererComponentModule<"test.lazy">>(() => {}),
          {
            fallback: LazyFallback,
          },
        ),
      },
      name: "test",
    });

    render(
      <LatticeRenderer
        nodes={[
          {
            id: "lazy-node",
            type: "test.lazy",
          },
        ]}
        registry={registry}
      />,
    );

    expect(screen.getByTestId("lazy-node-fallback")).toBeVisible();
  });
});
