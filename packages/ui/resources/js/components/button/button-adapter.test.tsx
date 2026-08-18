import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { Renderer } from "@lattice-php/core/renderer";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import { NavigationProvider, type NavigationAdapter } from "../../navigation";
import ButtonAdapter from "./button-adapter";

describe("ButtonAdapter client effects", () => {
  const registry = createRegistry({
    components: { button: eagerComponent(ButtonAdapter) },
    name: "test/button",
  });

  afterEach(() => vi.restoreAllMocks());

  it("dispatches its effects on click without a server request", () => {
    const node: Node = {
      key: "sidebar-toggle",
      props: {
        buttonType: "button",
        effects: [{ type: "toggle-sidebar", props: { target: "app-sidebar" } }],
        icon: "panel-left",
        label: "Toggle sidebar",
      },
      type: "button",
    };
    const listener = vi.fn<(event: Event) => void>();
    window.addEventListener(LATTICE_EVENT.toggleSidebar, listener);

    renderWithRegistry(<Renderer nodes={[node]} />, registry);
    fireEvent.click(screen.getByRole("button", { name: "Toggle sidebar" }));

    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toMatchObject({
      target: "app-sidebar",
    });

    window.removeEventListener(LATTICE_EVENT.toggleSidebar, listener);
  });

  it("navigates through the seeded navigation adapter", () => {
    const node: Node = {
      key: "open-report",
      props: { buttonType: "button", href: "/reports/1", label: "Open report", method: "get" },
      type: "button",
    };
    const adapter: NavigationAdapter = {
      Link: ({ href, method, children, ...props }) => (
        <a href={href} data-adapter-method={method} {...props}>
          {children}
        </a>
      ),
      visit: vi.fn(),
      reload: vi.fn(),
    };

    renderWithRegistry(
      <NavigationProvider adapter={adapter}>
        <Renderer nodes={[node]} />
      </NavigationProvider>,
      registry,
    );

    const link = screen.getByRole("link", { name: "Open report" });
    expect(link).toHaveAttribute("href", "/reports/1");
    expect(link).toHaveAttribute("data-adapter-method", "get");
  });
});
