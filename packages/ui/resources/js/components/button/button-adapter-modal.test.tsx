import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { renderWithRegistry, fakeNode, TextProbe } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import { ModalProvider } from "../../modal";
import { useClickBehavior } from "../../click-behavior";
import ButtonAdapter from "./button-adapter";
import ModalAdapter from "../modal/modal-adapter";

const registry = createRegistry({
  components: {
    button: eagerComponent(ButtonAdapter),
    modal: eagerComponent(ModalAdapter),
    text: eagerComponent(TextProbe),
  },
  name: "test/button-modal",
});

function buttonWithModal(): Node<"button"> {
  return fakeNode({
    id: "view-details",
    type: "button",
    props: {
      buttonType: "button",
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

describe("button with an embedded modal", () => {
  it("opens the modal it carries on click", () => {
    renderWithRegistry(
      <ModalProvider>
        <Renderer nodes={[buttonWithModal()]} />
      </ModalProvider>,
      registry,
    );

    expect(screen.queryByText("Order details")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Details" }));

    expect(screen.getByText("Order details")).toBeInTheDocument();
    expect(screen.getByText("Order body")).toBeInTheDocument();
  });

  it("throws when opened without a ModalProvider", () => {
    const modal = fakeNode<"modal">({ id: "order-details", type: "modal", props: {} });
    let onClick: (() => void) | undefined;

    function CaptureModalClick() {
      const behavior = useClickBehavior({ modal });

      if (behavior.kind === "modal") {
        onClick = behavior.onClick;
      }

      return null;
    }

    renderWithRegistry(<CaptureModalClick />, registry);

    expect(() => onClick?.()).toThrow("Embedded modals require a ModalProvider.");
  });
});
