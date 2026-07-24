import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { LATTICE_EVENT } from "@lattice-php/lattice/core/event-names";
import type { Node } from "@lattice-php/lattice/core/types";
import ModalComponent from "./modal";

function renderModal(node: Node<"modal">) {
  return render(
    <ModalComponent node={node}>
      <p>Body content</p>
    </ModalComponent>,
  );
}

function fire(event: string, modal: string | null) {
  act(() => {
    window.dispatchEvent(new CustomEvent(event, { detail: { modal } }));
  });
}

describe("ModalComponent", () => {
  it("renders open immediately when the open prop is set", () => {
    renderModal(
      fakeNode({ type: "modal", id: "welcome", props: { open: true, title: "Welcome" } }),
    );

    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("opens when the server flips the open prop on a later render", () => {
    const { rerender } = renderModal(
      fakeNode({ type: "modal", id: "welcome", props: { open: false, title: "Welcome" } }),
    );

    expect(screen.queryByText("Welcome")).not.toBeInTheDocument();

    rerender(
      <ModalComponent
        node={fakeNode({ type: "modal", id: "welcome", props: { open: true, title: "Welcome" } })}
      >
        <p>Body content</p>
      </ModalComponent>,
    );

    expect(screen.getByText("Welcome")).toBeInTheDocument();
  });

  it("does not fight a manual close when the server keeps open true across renders", () => {
    const { rerender } = renderModal(
      fakeNode({ type: "modal", id: "welcome", props: { open: true, title: "Welcome" } }),
    );
    expect(screen.getByText("Welcome")).toBeInTheDocument();

    fire(LATTICE_EVENT.closeModal, "welcome");
    expect(screen.queryByText("Welcome")).not.toBeInTheDocument();

    rerender(
      <ModalComponent
        node={fakeNode({ type: "modal", id: "welcome", props: { open: true, title: "Welcome" } })}
      >
        <p>Body content</p>
      </ModalComponent>,
    );

    expect(screen.queryByText("Welcome")).not.toBeInTheDocument();
  });

  it("stays closed until a matching open event arrives", () => {
    renderModal(fakeNode({ type: "modal", id: "confirm", props: { title: "Confirm" } }));

    expect(screen.queryByText("Confirm")).not.toBeInTheDocument();

    fire(LATTICE_EVENT.openModal, "confirm");
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("ignores open events aimed at a different modal", () => {
    renderModal(fakeNode({ type: "modal", id: "confirm", props: { title: "Confirm" } }));

    fire(LATTICE_EVENT.openModal, "other");
    expect(screen.queryByText("Confirm")).not.toBeInTheDocument();
  });

  it("opens on a broadcast event with no target modal", () => {
    renderModal(fakeNode({ type: "modal", id: "confirm", props: { title: "Confirm" } }));

    fire(LATTICE_EVENT.openModal, null);
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("closes on a matching close event", () => {
    renderModal(
      fakeNode({ type: "modal", id: "confirm", props: { open: true, title: "Confirm" } }),
    );
    expect(screen.getByText("Confirm")).toBeInTheDocument();

    fire(LATTICE_EVENT.closeModal, "confirm");
    expect(screen.queryByText("Confirm")).not.toBeInTheDocument();
  });

  it("falls back to the default title and never opens when it has no id", () => {
    renderModal(fakeNode({ type: "modal", props: {} }));

    fire(LATTICE_EVENT.openModal, null);
    expect(screen.queryByText("Dialog")).not.toBeInTheDocument();
  });

  it("restores focus to the opener element after closing", async () => {
    render(
      <>
        <button type="button">Open</button>
        <ModalComponent node={fakeNode({ type: "modal", id: "info", props: { title: "Info" } })}>
          <p>Body content</p>
        </ModalComponent>
      </>,
    );

    const opener = screen.getByRole("button", { name: "Open" });
    opener.focus();
    expect(opener).toHaveFocus();

    fire(LATTICE_EVENT.openModal, "info");
    expect(screen.getByText("Info")).toBeInTheDocument();
    expect(opener).not.toHaveFocus();

    fire(LATTICE_EVENT.closeModal, "info");
    expect(screen.queryByText("Info")).not.toBeInTheDocument();

    await act(async () => {
      await new Promise((resolve) => {
        requestAnimationFrame(() => resolve(undefined));
      });
    });

    expect(opener).toHaveFocus();
  });
});
