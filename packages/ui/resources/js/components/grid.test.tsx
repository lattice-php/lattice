import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import type { Node, RendererComponent } from "@lattice-php/core/types";
import GridComponent from "./grid";

const TextProbe: RendererComponent<"text"> = ({ node }) => <span>{String(node.props?.text)}</span>;

function renderGrid(
  props: Record<string, unknown>,
  children: Record<string, unknown>[] = [{ text: "child" }],
  key?: string,
) {
  const registry = createRegistry({
    components: {
      grid: eagerComponent(GridComponent),
      text: eagerComponent(TextProbe),
    },
    name: "test/grid",
  });

  const { container } = renderWithRegistry(
    <Renderer
      nodes={[
        {
          schema: children.map((childProps) => ({ props: childProps, type: "text" })),
          key,
          props,
          type: "grid",
        } as Node,
      ]}
    />,
    registry,
  );

  const grid = container.querySelector("[data-slot=grid]");
  const items = [...container.querySelectorAll("[data-slot=grid-item]")];

  return { container, grid, items };
}

describe("GridComponent", () => {
  it("wraps each child in a grid item", () => {
    const { grid, items } = renderGrid({ columns: { md: 2 } }, [
      { text: "first" },
      { text: "second" },
    ]);

    expect(screen.getByText("first")).toBeInTheDocument();
    expect(items).toHaveLength(2);
    expect(items[0]?.parentElement).toBe(grid);
  });

  it("exposes the node identity for component targeting", () => {
    const { grid } = renderGrid({ columns: { md: 2 } }, undefined, "summary");

    expect(grid).toHaveAttribute("data-lattice-component", "summary");
  });

  it("turns integer column counts into equal-track template variables per breakpoint", () => {
    const { grid } = renderGrid({ columns: { default: 1, md: 3 } });

    expect(grid?.getAttribute("style")).toContain(
      "--lt-grid-cols-default: repeat(1, minmax(0, 1fr))",
    );
    expect(grid?.getAttribute("style")).toContain("--lt-grid-cols-md: repeat(3, minmax(0, 1fr))");
  });

  it("passes string track lists through as raw template variables", () => {
    const { grid } = renderGrid({ columns: { md: "2fr 1fr 1fr 1fr" } });

    expect(grid?.getAttribute("style")).toContain("--lt-grid-cols-md: 2fr 1fr 1fr 1fr");
  });

  it("renders no template variables without columns", () => {
    const { grid } = renderGrid({ columns: null });

    expect(grid?.getAttribute("style")).toBeNull();
  });

  it("sets span variables on items from the child column span", () => {
    const { items } = renderGrid({ columns: { md: 4 } }, [
      { text: "wide", columnSpan: { md: 2 } },
      { text: "narrow" },
    ]);

    expect(items[0]?.getAttribute("style")).toContain("--lt-col-span-md: span 2 / span 2");
    expect(items[1]?.getAttribute("style")).toBeNull();
  });

  it("turns full spans into a full-row placement", () => {
    const { items } = renderGrid({ columns: { md: 3 } }, [
      { text: "banner", columnSpan: { default: "full" } },
    ]);

    expect(items[0]?.getAttribute("style")).toContain("--lt-col-span-default: 1 / -1");
  });
});
