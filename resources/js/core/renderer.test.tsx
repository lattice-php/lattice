import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent, lazyComponent } from "@lattice-php/lattice";
import { Renderer } from "@lattice-php/lattice";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import { CollapsedContext } from "./collapsed-context";
import type { RendererComponent, RendererComponentModule } from "./types";

const TestComponent: RendererComponent<"test.component"> = ({ children, node }) => (
  <section data-test={node.id}>
    {node.props?.label as string | undefined}
    {children}
  </section>
);

describe("Renderer", () => {
  it("renders registered components recursively", () => {
    const registry = createRegistry({
      components: {
        "test.component": eagerComponent(TestComponent),
      },
      name: "test",
    });

    renderWithRegistry(
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
      />,
      registry,
    );

    expect(screen.getByTestId("parent")).toContainElement(screen.getByTestId("child"));
  });

  it("renders the built-in missing-component marker for unknown types", () => {
    const registry = createRegistry({ components: {}, name: "empty" });

    renderWithRegistry(<Renderer nodes={[{ type: "unknown.component" }]} />, registry);

    expect(screen.getByText("Missing component: unknown.component")).toBeVisible();
  });

  it("renders a visible icon placeholder for unknown types so the gap is never invisible", () => {
    const registry = createRegistry({ components: {}, name: "empty" });

    renderWithRegistry(<Renderer nodes={[{ type: "widget.unknown" }]} />, registry);

    const marker = screen.getByTitle("Missing component: widget.unknown");

    expect(marker).toBeVisible();
    expect(marker.querySelector("svg")).not.toBeNull();
  });

  it("warns once, with actionable guidance, when a node type has no renderer", () => {
    const registry = createRegistry({ components: {}, name: "empty" });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    renderWithRegistry(
      <Renderer nodes={[{ type: "app.unregistered" }, { type: "app.unregistered" }]} />,
      registry,
    );

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain("app.unregistered");
    expect(warn.mock.calls[0]?.[0]).toContain("createLatticeApp({ registry })");

    warn.mockRestore();
  });

  it("skips nodes that hide when their sidebar context is collapsed", () => {
    const registry = createRegistry({
      components: {
        "test.component": eagerComponent(TestComponent),
      },
      name: "test",
    });

    renderWithRegistry(
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
        />
      </CollapsedContext.Provider>,
      registry,
    );

    expect(screen.getByText("Visible")).toBeVisible();
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("renders a lazy component fallback while the chunk is loading", () => {
    const LazyFallback: RendererComponent<"test.lazy"> = ({ node }) => (
      <div data-test={`${node.id}-fallback`} />
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

    renderWithRegistry(
      <Renderer
        nodes={[
          {
            id: "lazy-node",
            type: "test.lazy",
          },
        ]}
      />,
      registry,
    );

    expect(screen.getByTestId("lazy-node-fallback")).toBeVisible();
  });
});
