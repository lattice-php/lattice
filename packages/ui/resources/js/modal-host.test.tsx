import { act, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { renderWithRegistry, fakeNode } from "@lattice-php/core/test-support";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import type { Node } from "@lattice-php/core/types";
import ModalComponent from "./components/modal";
import { ModalHostProvider, useModalHost } from "./modal-host";

const registry = createRegistry({
  components: { modal: eagerComponent(ModalComponent) },
  name: "test/modal-host",
});

function modalNode(id: string, title: string): Node<"modal"> {
  return fakeNode({ type: "modal", id, props: { title } });
}

function OpenButton({ label, node }: { label: string; node: Node<"modal"> }) {
  const host = useModalHost();

  return (
    <button onClick={() => host.open(node)} type="button">
      {label}
    </button>
  );
}

function fireModalEvent(type: string, detail: Record<string, unknown>) {
  act(() => {
    window.dispatchEvent(new CustomEvent(type, { detail }));
  });
}

describe("ModalHostProvider", () => {
  it("opens a modal through useModalHost().open()", () => {
    renderWithRegistry(
      <ModalHostProvider>
        <OpenButton label="Open" node={modalNode("welcome", "Welcome")} />
      </ModalHostProvider>,
      registry,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.getByText("Welcome")).toBeInTheDocument();
  });

  it("opens through a lattice:open-modal event carrying the node", () => {
    renderWithRegistry(<ModalHostProvider>{null}</ModalHostProvider>, registry);

    expect(screen.queryByText("Welcome")).not.toBeInTheDocument();

    fireModalEvent(LATTICE_EVENT.openModal, { node: modalNode("welcome", "Welcome") });

    expect(screen.getByText("Welcome")).toBeInTheDocument();
  });

  it("closes on Escape and replaces the node on the next open()", () => {
    renderWithRegistry(
      <ModalHostProvider>
        <OpenButton label="Open first" node={modalNode("first", "First")} />
        <OpenButton label="Open second" node={modalNode("second", "Second")} />
      </ModalHostProvider>,
      registry,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open first" }));
    expect(screen.getByText("First")).toBeInTheDocument();

    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(screen.queryByText("First")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open second" }));
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.queryByText("First")).not.toBeInTheDocument();
  });

  it("closes on a matching lattice:close-modal id and ignores a non-matching one", () => {
    renderWithRegistry(
      <ModalHostProvider>
        <OpenButton label="Open" node={modalNode("welcome", "Welcome")} />
      </ModalHostProvider>,
      registry,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Welcome")).toBeInTheDocument();

    fireModalEvent(LATTICE_EVENT.closeModal, { modal: "other" });
    expect(screen.getByText("Welcome")).toBeInTheDocument();

    fireModalEvent(LATTICE_EVENT.closeModal, { modal: "welcome" });
    expect(screen.queryByText("Welcome")).not.toBeInTheDocument();
  });

  it("closes on a lattice:close-modal event with no target modal", () => {
    renderWithRegistry(
      <ModalHostProvider>
        <OpenButton label="Open" node={modalNode("welcome", "Welcome")} />
      </ModalHostProvider>,
      registry,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Welcome")).toBeInTheDocument();

    fireModalEvent(LATTICE_EVENT.closeModal, { modal: null });
    expect(screen.queryByText("Welcome")).not.toBeInTheDocument();
  });

  it("renders nothing and warns once when a modal node has no ModalHostProvider", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    renderWithRegistry(
      <ModalComponent node={modalNode("welcome", "Welcome")}>
        <p>Body content</p>
      </ModalComponent>,
      registry,
    );

    expect(screen.queryByText("Welcome")).not.toBeInTheDocument();
    expect(warn).toHaveBeenCalledTimes(1);

    warn.mockRestore();
  });
});
