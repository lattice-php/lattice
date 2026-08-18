import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { renderWithRegistry, fakeNode, TextProbe } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import ModalComponent from "@lattice-php/ui/components/modal/modal-adapter";
import { ModalProvider } from "@lattice-php/ui/modal";
import MenuItemComponent from "./menu-item";

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock({
    usePage: () => ({ url: "/products" }),
  }),
);

const registry = createRegistry({
  components: {
    "menu-item": eagerComponent(MenuItemComponent),
    modal: eagerComponent(ModalComponent),
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

describe("menu item with an embedded modal", () => {
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
