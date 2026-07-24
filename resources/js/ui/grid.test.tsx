import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import GridComponent from "./grid";

function renderGrid(columns: number | null, key?: string) {
  const node = fakeNode({ type: "grid", key, props: { columns } });
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

  it("exposes the node identity for component targeting", () => {
    const { container } = renderGrid(1, "summary");

    expect(container.firstElementChild).toHaveAttribute("data-lattice-component", "summary");
  });
});
