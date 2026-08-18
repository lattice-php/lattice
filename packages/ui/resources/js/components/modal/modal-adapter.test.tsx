import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import { EmbeddedModalContext } from "../../modal-host";
import ModalAdapter from "./modal-adapter";

function renderModal(node: Node<"modal">, open = true, onOpenChange = vi.fn(), onExited = vi.fn()) {
  render(
    <EmbeddedModalContext.Provider value={{ open, onOpenChange, onExited }}>
      <ModalAdapter node={node}>
        <p>Body content</p>
      </ModalAdapter>
    </EmbeddedModalContext.Provider>,
  );

  return onOpenChange;
}

describe("ModalAdapter", () => {
  it("renders its content while the host reports it open", () => {
    renderModal(fakeNode({ type: "modal", id: "welcome", props: { title: "Welcome" } }));

    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("renders nothing while the host reports it closed", () => {
    renderModal(fakeNode({ type: "modal", id: "welcome", props: { title: "Welcome" } }), false);

    expect(screen.queryByText("Welcome")).not.toBeInTheDocument();
  });

  it("tells the host to close when the dialog close button is clicked", () => {
    const onOpenChange = renderModal(
      fakeNode({ type: "modal", id: "welcome", props: { title: "Welcome" } }),
    );

    fireEvent.click(screen.getByTestId("dialog-close"));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
