import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice/lattice/core/registry";
import { Renderer } from "@lattice/lattice/core/renderer";
import type { Node } from "@lattice/lattice/core/types";
import SidebarComponent from "./sidebar";

const registry = createRegistry({
  components: { sidebar: eagerComponent(SidebarComponent) },
  name: "test/sidebar",
});

function renderSidebar(props: { collapsible: boolean; rememberState: boolean }) {
  const node: Node = { id: "app-sidebar", props, type: "sidebar" };

  return render(<Renderer nodes={[node]} registry={registry} />);
}

describe("Sidebar", () => {
  afterEach(() => window.localStorage.clear());

  it("renders a fixed-width aside with no toggle when not collapsible", () => {
    renderSidebar({ collapsible: false, rememberState: false });

    expect(screen.getByRole("complementary")).toHaveClass("w-64", "shrink-0");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("collapses to the icon rail when the toggle is clicked", () => {
    renderSidebar({ collapsible: true, rememberState: false });

    expect(screen.getByRole("complementary")).toHaveClass("w-64");

    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));

    expect(screen.getByRole("complementary")).toHaveClass("w-16");
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeVisible();
  });

  it("remembers the collapsed state when rememberState is on", () => {
    const { unmount } = renderSidebar({ collapsible: true, rememberState: true });

    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(window.localStorage.getItem("lattice:sidebar:app-sidebar")).toBe("true");

    unmount();
    renderSidebar({ collapsible: true, rememberState: true });

    expect(screen.getByRole("complementary")).toHaveClass("w-16");
  });

  it("does not persist the collapsed state when rememberState is off", () => {
    renderSidebar({ collapsible: true, rememberState: false });

    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));

    expect(window.localStorage.getItem("lattice:sidebar:app-sidebar")).toBeNull();
  });
});
