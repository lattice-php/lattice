import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { renderWithRegistry, fakeNode, TextProbe } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import { ModalProvider } from "../modal/modal-host";
import { ModalAdapter } from "../modal/modal-adapter";
import { MenuItemAdapter } from "./menu-item-adapter";

const registry = createRegistry({
  components: {
    "menu-item": eagerComponent(MenuItemAdapter),
    modal: eagerComponent(ModalAdapter),
    text: eagerComponent(TextProbe),
  },
  name: "test/menu-item-modal",
});

function menuItemWithModal(): Node<"menu-item"> {
  return fakeNode({
    id: "view-details",
    type: "menu-item",
    props: {
      label: "Details",
      modal: fakeNode({
        id: "order-details",
        type: "modal",
        props: { title: "Order details" },
        schema: [fakeNode({ type: "text", props: { text: "Order body" } })],
      }),
    },
  });
}

describe("MenuItemAdapter with an embedded modal", () => {
  it("opens the modal it carries on click", () => {
    renderWithRegistry(
      <ModalProvider>
        <ul>
          <Renderer nodes={[menuItemWithModal()]} />
        </ul>
      </ModalProvider>,
      registry,
    );

    expect(screen.queryByText("Order details")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Details" }));

    expect(screen.getByText("Order details")).toBeInTheDocument();
    expect(screen.getByText("Order body")).toBeInTheDocument();
  });
});
