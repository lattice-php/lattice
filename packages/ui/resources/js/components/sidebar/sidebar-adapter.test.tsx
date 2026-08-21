import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { Renderer } from "@lattice-php/core/renderer";
import { renderWithRegistry, stubMatchMedia } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import { defaultNavigation, NavigationProvider } from "../../navigation";
import { SidebarAdapter } from "./sidebar-adapter";
import { SidebarFooterAdapter } from "./sidebar-footer-adapter";

const registry = createRegistry({
  components: {
    sidebar: eagerComponent(SidebarAdapter),
    "sidebar.footer": eagerComponent(SidebarFooterAdapter),
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

describe("SidebarAdapter", () => {
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

  it("renders the footer node inside the sidebar", () => {
    const node: Node = {
      id: "app-sidebar",
      props: { collapsible: false, rememberState: false },
      schema: [{ id: "footer", props: {}, type: "sidebar.footer" }],
      type: "sidebar",
    };

    renderWithRegistry(<Renderer nodes={[node]} />, registry);

    expect(screen.getByRole("complementary").querySelector('[data-test="footer"]')).not.toBeNull();
  });
});

describe("SidebarAdapter drawer", () => {
  beforeEach(() => stubMatchMedia(false));

  it("closes the mobile drawer when the navigation adapter reports a navigation", () => {
    const listeners: Array<() => void> = [];
    const node: Node = {
      id: "app-sidebar",
      props: { collapsible: true, rememberState: false },
      type: "sidebar",
    };

    renderWithRegistry(
      <NavigationProvider
        adapter={{
          ...defaultNavigation,
          onNavigate: (listener) => {
            listeners.push(listener);

            return () => undefined;
          },
        }}
      >
        <Renderer nodes={[node]} />
      </NavigationProvider>,
      registry,
    );

    dispatchToggle();
    expect(screen.getByTestId("sidebar-backdrop")).toBeInTheDocument();

    act(() => listeners.forEach((listener) => listener()));

    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });
});
