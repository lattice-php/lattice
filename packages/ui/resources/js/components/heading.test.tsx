import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import HeadingComponent from "./heading";

function renderHeading(level: number, text = "Title", tooltip: string | null = null) {
  const node = fakeNode({ type: "heading", props: { level, text, tooltip } });
  return render(<HeadingComponent node={node}>{null}</HeadingComponent>);
}

describe("HeadingComponent", () => {
  it("clamps levels below 1 to an h1", () => {
    renderHeading(0);

    expect(screen.getByRole("heading", { level: 1 }).tagName).toBe("H1");
  });

  it("clamps levels above 6 to an h6", () => {
    renderHeading(9);

    expect(screen.getByRole("heading", { level: 6 }).tagName).toBe("H6");
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
