import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import GridComponent from "./grid";

function renderGrid(columns: number | null, key?: string) {
  const node = { type: "grid", key, props: { columns } } as Node<"grid">;
  return render(
    <GridComponent node={node}>
      <span>child</span>
    </GridComponent>,
  );
}

describe("GridComponent", () => {
  it("renders its children inside a grid container", () => {
    renderGrid(2);

    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("defaults to a single column when columns is null", () => {
    const { container } = renderGrid(null);
    const grid = container.firstElementChild!;

    expect(grid).toHaveClass("grid");
    expect(grid).not.toHaveClass("md:grid-cols-2");
  });

  it("adds responsive column classes up to the requested count", () => {
    const { container } = renderGrid(3);
    const grid = container.firstElementChild!;

    expect(grid).toHaveClass("md:grid-cols-2", "lg:grid-cols-3");
    expect(grid).not.toHaveClass("xl:grid-cols-4");
  });

  it("clamps columns above 4 to four columns", () => {
    const { container } = renderGrid(9);

    expect(container.firstElementChild).toHaveClass("xl:grid-cols-4");
  });

  it("clamps columns below 1 to a single column", () => {
    const { container } = renderGrid(0);

    expect(container.firstElementChild).not.toHaveClass("md:grid-cols-2");
  });

  it("exposes the node identity for component targeting", () => {
    const { container } = renderGrid(1, "summary");

    expect(container.firstElementChild).toHaveAttribute("data-lattice-component", "summary");
  });
});
