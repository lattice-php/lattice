import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { Renderer } from "@lattice-php/core/renderer";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import SidebarComponent from "./sidebar";
import SidebarFooterComponent from "./sidebar-footer";

const registry = createRegistry({
  components: {
    sidebar: eagerComponent(SidebarComponent),
    "sidebar.footer": eagerComponent(SidebarFooterComponent),
  },
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

  it("collapses to the icon rail when a toggle event targets it", () => {
    renderSidebar({ collapsible: true, rememberState: false });

    dispatchToggle();

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

    expect(screen.getByRole("complementary")).toHaveAttribute("data-collapsed", "true");
  });

  it("does not persist the collapsed state when rememberState is off", () => {
    renderSidebar({ collapsible: true, rememberState: false });

    dispatchToggle();

    expect(window.localStorage.getItem("lattice:sidebar:app-sidebar")).toBeNull();
  });

  it("pins footer children to the bottom of the sidebar", () => {
    const node: Node = {
      id: "app-sidebar",
      props: { collapsible: false, rememberState: false },
      schema: [{ id: "footer", props: {}, type: "sidebar.footer" }],
      type: "sidebar",
    };

    renderWithRegistry(<Renderer nodes={[node]} />, registry);

    const footer = screen
      .getByRole("complementary")
      .querySelector('[data-lattice-component="footer"]');
    expect(footer).not.toBeNull();
    expect(footer).toHaveClass("mt-auto");
  });
});
