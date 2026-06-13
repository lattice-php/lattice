import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent, lazyComponent } from "@lattice/lattice";
import { Renderer } from "@lattice/lattice";
import { CollapsedContext } from "./collapsed-context";
import type { RendererComponent, RendererComponentModule } from "./types";

const TestComponent: RendererComponent<"test.component"> = ({ children, node }) => (
  <section data-testid={node.id}>
    {node.props?.label as string | undefined}
    {children}
  </section>
);

describe("Renderer", () => {
  it("renders registered components recursively", () => {
    const { components } = createRegistry({
      components: {
        "test.component": eagerComponent(TestComponent),
      },
      name: "test",
    });

    render(
      <Renderer
        nodes={[
          {
            schema: [
              {
                id: "child",
                type: "test.component",
              },
            ],
            id: "parent",
            type: "test.component",
          },
        ]}
        registry={components}
      />,
    );

    expect(screen.getByTestId("parent")).toContainElement(screen.getByTestId("child"));
  });

  it("renders the configured missing component fallback", () => {
    render(
      <Renderer
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

  it("skips nodes that hide when their sidebar context is collapsed", () => {
    const { components } = createRegistry({
      components: {
        "test.component": eagerComponent(TestComponent),
      },
      name: "test",
    });

    render(
      <CollapsedContext.Provider value={true}>
        <Renderer
          nodes={[
            {
              id: "visible",
              props: { label: "Visible" },
              type: "test.component",
            },
            {
              id: "hidden",
              props: { hideWhenCollapsed: true, label: "Hidden" },
              type: "test.component",
            },
          ]}
          registry={components}
        />
      </CollapsedContext.Provider>,
    );

    expect(screen.getByText("Visible")).toBeVisible();
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("renders a lazy component fallback while the chunk is loading", () => {
    const LazyFallback: RendererComponent<"test.lazy"> = ({ node }) => (
      <div data-testid={`${node.id}-fallback`} />
    );

    const { components } = createRegistry({
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
      <Renderer
        nodes={[
          {
            id: "lazy-node",
            type: "test.lazy",
          },
        ]}
        registry={components}
      />,
    );

    expect(screen.getByTestId("lazy-node-fallback")).toBeVisible();
  });
});
