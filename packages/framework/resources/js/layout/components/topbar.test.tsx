import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import TopbarComponent from "./topbar";

describe("Lattice topbar component", () => {
  it("renders a header bar with its children", () => {
    const node = fakeNode({ id: "app-topbar", props: { sticky: false }, type: "topbar" });

    render(<TopbarComponent node={node}>Content</TopbarComponent>);

    const el = screen.getByText("Content");
    expect(el.tagName).toBe("HEADER");
    expect(el).toHaveClass("flex", "h-14", "w-full", "items-center", "border-b", "bg-lt-bg");
    expect(el).not.toHaveClass("sticky");
  });
});
