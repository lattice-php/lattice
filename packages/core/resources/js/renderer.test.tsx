import { fireEvent, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent, lazyComponent } from "./registry";
import { Renderer } from "./renderer";
import { CollapsedContext } from "./collapsed-context";
import type { RendererComponent, RendererComponentModule } from "./index";
import { renderWithRegistry } from "./test-support";

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

  it("renders a visible missing-component marker with an icon for unknown types", () => {
    const registry = createRegistry({ components: {}, name: "empty" });

    renderWithRegistry(<Renderer nodes={[{ type: "unknown.component" }]} />, registry);

    const marker = screen.getByTitle("Missing component: unknown.component");

    expect(marker).toBeVisible();
    expect(marker.querySelector("svg")).not.toBeNull();
    expect(screen.getByText("Missing component: unknown.component")).toBeVisible();
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

  it("wraps responsive visibility in a layout-transparent span", () => {
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
            id: "mobile-only",
            props: { hiddenFrom: "md", label: "Mobile only" },
            type: "test.component",
          },
          {
            id: "desktop-only",
            props: { label: "Desktop only", visibleFrom: "md" },
            type: "test.component",
          },
          {
            id: "everywhere",
            props: { label: "Everywhere" },
            type: "test.component",
          },
        ]}
      />,
      registry,
    );

    expect(screen.getByTestId("mobile-only").parentElement).toHaveClass("contents", "md:hidden");
    expect(screen.getByTestId("desktop-only").parentElement).toHaveClass("hidden", "md:contents");
    expect(screen.getByTestId("everywhere").parentElement).not.toHaveClass("contents");
  });

  it("recovers a lazy component whose chunk fails to load once", async () => {
    const LazyProbe: RendererComponent<"test.lazy"> = ({ node }) => (
      <section>{node.props?.label as string | undefined}</section>
    );
    let attempts = 0;
    const registry = createRegistry({
      components: {
        "test.lazy": lazyComponent<"test.lazy">(() => {
          attempts++;

          return attempts === 1
            ? Promise.reject(new Error("Failed to fetch dynamically imported module"))
            : Promise.resolve({ default: LazyProbe });
        }),
      },
      name: "test",
    });

    renderWithRegistry(
      <Renderer nodes={[{ id: "flaky-node", props: { label: "Recovered" }, type: "test.lazy" }]} />,
      registry,
    );

    expect(await screen.findByText("Recovered", undefined, { timeout: 3000 })).toBeVisible();
    expect(attempts).toBe(2);
  });

  it("suspends to an empty fallback while a lazy chunk is loading", () => {
    const registry = createRegistry({
      components: {
        "test.lazy": lazyComponent(
          () => new Promise<RendererComponentModule<"test.lazy">>(() => {}),
        ),
      },
      name: "test",
    });

    const { container } = renderWithRegistry(
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

    expect(container).toBeEmptyDOMElement();
  });

  it("does not rerender stable nodes when a parent updates", () => {
    let renders = 0;
    const node = { id: "stable-node", type: "test.counter" };
    const CounterComponent: RendererComponent<"test.counter"> = ({ node }) => {
      renders++;

      return <div data-test={node.id} />;
    };
    const Parent = () => {
      const [count, setCount] = useState(0);

      return (
        <>
          <button type="button" onClick={() => setCount((current) => current + 1)}>
            {count}
          </button>
          <Renderer nodes={[node]} />
        </>
      );
    };
    const registry = createRegistry({
      components: {
        "test.counter": eagerComponent(CounterComponent),
      },
      name: "test",
    });

    renderWithRegistry(<Parent />, registry);

    expect(renders).toBe(1);

    fireEvent.click(screen.getByRole("button"));

    expect(renders).toBe(1);
  });
});
