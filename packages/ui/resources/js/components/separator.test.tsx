import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import SeparatorComponent from "./separator";

function renderSeparator(orientation: "horizontal" | "vertical") {
  const node = fakeNode({ type: "separator", props: { orientation } });
  return render(<SeparatorComponent node={node}>{null}</SeparatorComponent>);
}

describe("SeparatorComponent", () => {
  it("renders a horizontal hairline by default orientation", () => {
    renderSeparator("horizontal");

    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("aria-orientation", "horizontal");
    expect(separator).toHaveClass("h-px", "w-full");
  });

  it("renders a vertical hairline", () => {
    renderSeparator("vertical");

    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
    expect(separator).toHaveClass("w-px", "h-full");
  });
});
