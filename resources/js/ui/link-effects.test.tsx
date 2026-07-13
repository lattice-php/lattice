import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/lattice/core/registry";
import { LATTICE_EVENT } from "@lattice-php/lattice/events/event-names";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import type { Node } from "@lattice-php/lattice/core/types";
import LinkComponent from "./link";

describe("LinkComponent client effects", () => {
  const registry = createRegistry({
    components: { link: eagerComponent(LinkComponent) },
    name: "test/link",
  });

  it("dispatches its effects on click without a server request", () => {
    const node: Node = {
      key: "collapse",
      props: {
        effects: [{ type: "toggle-sidebar", props: { target: "app-sidebar" } }],
        label: "Collapse",
      },
      type: "link",
    };
    const listener = vi.fn<(event: Event) => void>();
    window.addEventListener(LATTICE_EVENT.toggleSidebar, listener);

    renderWithRegistry(<Renderer nodes={[node]} />, registry);
    fireEvent.click(screen.getByRole("button", { name: "Collapse" }));

    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toMatchObject({
      target: "app-sidebar",
    });

    window.removeEventListener(LATTICE_EVENT.toggleSidebar, listener);
  });
});
