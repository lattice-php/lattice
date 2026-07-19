import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import HeadingComponent from "./heading";

function renderHeading(level: number, text = "Title", tooltip: string | null = null) {
  const node = fakeNode({ type: "heading", props: { level, text, tooltip } });
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

  it("renders no copy control by default", () => {
    renderHeading(2);

    expect(screen.queryByRole("button", { name: /Copy/ })).not.toBeInTheDocument();
  });

  it("wraps the heading in a copy control when copyable", () => {
    const node = fakeNode({
      type: "heading",
      props: { level: 2, text: "API Key", tooltip: null, copyable: true },
    });
    render(<HeadingComponent node={node}>{null}</HeadingComponent>);

    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy API Key" })).toBeInTheDocument();
  });

  it("reveals a tooltip after the heading text on click", () => {
    const node = fakeNode({
      type: "heading",
      props: { level: 2, text: "Billing", tooltip: "Invoices go out monthly." },
    });
    render(<HeadingComponent node={node}>{null}</HeadingComponent>);

    fireEvent.click(screen.getByRole("button", { name: "More information" }));
    expect(screen.getByText("Invoices go out monthly.")).toBeVisible();
  });
});
