import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/lattice/core/registry";
import { LATTICE_EVENT } from "@lattice-php/lattice/core/event-names";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import type { Node } from "@lattice-php/lattice/core/types";
import ButtonComponent, { Button } from "./button";

describe("Button variants", () => {
  it("applies the success variant classes", () => {
    render(<Button variant="success">Save</Button>);

    expect(screen.getByRole("button")).toHaveClass("bg-lt-success", "text-lt-success-fg");
  });

  it("applies the info variant classes", () => {
    render(<Button variant="info">Details</Button>);

    expect(screen.getByRole("button")).toHaveClass("bg-lt-info", "text-lt-info-fg");
  });
});

describe("ButtonComponent client effects", () => {
  const registry = createRegistry({
    components: { button: eagerComponent(ButtonComponent) },
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
});
