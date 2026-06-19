import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice-php/lattice/core/types";
import HeadingComponent from "./heading";

function renderHeading(level: number, text = "Title") {
  const node = { type: "heading", props: { level, text } } as Node<"heading">;
  return render(<HeadingComponent node={node}>{null}</HeadingComponent>);
}

describe("HeadingComponent", () => {
  it.each([
    [1, "H1"],
    [2, "H2"],
    [3, "H3"],
    [4, "H4"],
    [5, "H5"],
    [6, "H6"],
  ])("renders an h%i element", (level, role) => {
    renderHeading(level, role);

    expect(screen.getByRole("heading", { level }).tagName).toBe(`H${level}`);
    expect(screen.getByText(role)).toBeInTheDocument();
  });

  it("clamps levels below 1 to an h1", () => {
    renderHeading(0);

    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-2xl", "font-bold");
  });

  it("clamps levels above 6 to an h6", () => {
    renderHeading(9);

    expect(screen.getByRole("heading", { level: 6 })).toHaveClass("text-base");
  });

  it("uses the level-2 size class for h2", () => {
    renderHeading(2);

    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-xl");
  });
});
