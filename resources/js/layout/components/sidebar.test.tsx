import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/lattice/core/registry";
import { LATTICE_EVENT } from "@lattice-php/lattice/events/event-names";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import type { Node } from "@lattice-php/lattice/core/types";
import SidebarComponent from "./sidebar";

const registry = createRegistry({
  components: { sidebar: eagerComponent(SidebarComponent) },
  name: "test/sidebar",
});

function renderSidebar(props: { collapsible: boolean; rememberState: boolean }) {
  const node: Node = { id: "app-sidebar", props, type: "sidebar" };

  return renderWithRegistry(<Renderer nodes={[node]} />, registry);
}

function dispatchToggle(): void {
  fireEvent(
    window,
    new CustomEvent(LATTICE_EVENT.toggleSidebar, { detail: { target: "app-sidebar" } }),
  );
}

describe("Sidebar", () => {
  afterEach(() => window.localStorage.clear());

  it("renders an aside with no built-in toggle button", () => {
    renderSidebar({ collapsible: false, rememberState: false });

    expect(screen.getByRole("complementary")).toHaveClass("fixed", "md:sticky", "md:w-64");
    expect(screen.getByRole("complementary")).toHaveAttribute("data-collapsed", "false");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("collapses to the icon rail when a toggle event targets it", () => {
    renderSidebar({ collapsible: true, rememberState: false });

    expect(screen.getByRole("complementary")).toHaveClass("md:w-64");

    dispatchToggle();

    expect(screen.getByRole("complementary")).toHaveClass("md:w-16", "md:overflow-visible");
    expect(screen.getByRole("complementary")).toHaveAttribute("data-collapsed", "true");
  });

  it("ignores toggle events aimed at a different sidebar", () => {
    renderSidebar({ collapsible: true, rememberState: false });

    fireEvent(
      window,
      new CustomEvent(LATTICE_EVENT.toggleSidebar, { detail: { target: "other" } }),
    );

    expect(screen.getByRole("complementary")).toHaveAttribute("data-collapsed", "false");
  });

  it("remembers the collapsed state when rememberState is on", () => {
    const { unmount } = renderSidebar({ collapsible: true, rememberState: true });

    dispatchToggle();
    expect(window.localStorage.getItem("lattice:sidebar:app-sidebar")).toBe("true");

    unmount();
    renderSidebar({ collapsible: true, rememberState: true });

    expect(screen.getByRole("complementary")).toHaveClass("md:w-16");
  });

  it("does not persist the collapsed state when rememberState is off", () => {
    renderSidebar({ collapsible: true, rememberState: false });

    dispatchToggle();

    expect(window.localStorage.getItem("lattice:sidebar:app-sidebar")).toBeNull();
  });
});
