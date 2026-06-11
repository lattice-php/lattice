import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice/lattice/core/registry";
import { Renderer } from "@lattice/lattice/core/renderer";
import type { Node } from "@lattice/lattice/core/types";
import SidebarComponent from "./sidebar";

const registry = createRegistry({
  components: { sidebar: eagerComponent(SidebarComponent) },
  name: "test/sidebar",
});

const sidebar: Node = {
  id: "app-sidebar",
  type: "sidebar",
};

describe("Sidebar", () => {
  it("renders a fixed-width aside that does not shrink", () => {
    render(<Renderer nodes={[sidebar]} registry={registry} />);

    const aside = screen.getByRole("complementary");

    expect(aside).toHaveClass("w-64", "shrink-0");
  });
});
