import { act, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { renderWithRegistry, fakeNode } from "@lattice-php/core/test-support";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import type { Node } from "@lattice-php/core/types";
import ModalComponent from "./components/modal";
import { ModalHostProvider, useEmbeddedModal, useModalHost } from "./modal-host";

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

function OpenElementButton({ label, title }: { label: string; title: string }) {
  const host = useModalHost();

  return (
    <button onClick={() => host.open(<ElementDialog title={title} />)} type="button">
      {label}
    </button>
  );
}

function ElementDialog({ title }: { title: string }) {
  const context = useEmbeddedModal();

  if (context && !context.open) {
    return null;
  }

  return (
    <div role="dialog" aria-label={title}>
      <span>{title}</span>
      <button onClick={() => context?.onOpenChange(false)} type="button">
        Close {title}
      </button>
    </div>
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

  it("stacks a second node modal above the first, which stays mounted", () => {
    renderWithRegistry(
      <ModalHostProvider>
        <OpenButton label="Open first" node={modalNode("first", "First")} />
        <OpenButton label="Open second" node={modalNode("second", "Second")} />
      </ModalHostProvider>,
      registry,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open first" }));
    fireEvent.click(screen.getByRole("button", { name: "Open second", hidden: true }));

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("closes only the topmost entry on Escape, leaving the lower one open", () => {
    renderWithRegistry(
      <ModalHostProvider>
        <OpenButton label="Open first" node={modalNode("first", "First")} />
        <OpenButton label="Open second" node={modalNode("second", "Second")} />
      </ModalHostProvider>,
      registry,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open first" }));
    fireEvent.click(screen.getByRole("button", { name: "Open second", hidden: true }));

    fireEvent.keyDown(document.body, { key: "Escape" });

    expect(screen.queryByText("Second")).not.toBeInTheDocument();
    expect(screen.getByText("First")).toBeInTheDocument();
  });

  it("closes only the matching mid-stack entry on a targeted lattice:close-modal", () => {
    renderWithRegistry(
      <ModalHostProvider>
        <OpenButton label="Open first" node={modalNode("first", "First")} />
        <OpenButton label="Open second" node={modalNode("second", "Second")} />
        <OpenButton label="Open third" node={modalNode("third", "Third")} />
      </ModalHostProvider>,
      registry,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open first" }));
    fireEvent.click(screen.getByRole("button", { name: "Open second", hidden: true }));
    fireEvent.click(screen.getByRole("button", { name: "Open third", hidden: true }));

    fireModalEvent(LATTICE_EVENT.closeModal, { modal: "second" });

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.queryByText("Second")).not.toBeInTheDocument();
    expect(screen.getByText("Third")).toBeInTheDocument();
  });

  it("closes the topmost open entry on a lattice:close-modal event with no target", () => {
    renderWithRegistry(
      <ModalHostProvider>
        <OpenButton label="Open first" node={modalNode("first", "First")} />
        <OpenButton label="Open second" node={modalNode("second", "Second")} />
      </ModalHostProvider>,
      registry,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open first" }));
    fireEvent.click(screen.getByRole("button", { name: "Open second", hidden: true }));

    fireModalEvent(LATTICE_EVENT.closeModal, { modal: null });

    expect(screen.queryByText("Second")).not.toBeInTheDocument();
    expect(screen.getByText("First")).toBeInTheDocument();
  });

  it("ignores a lattice:close-modal id that doesn't match any entry", () => {
    renderWithRegistry(
      <ModalHostProvider>
        <OpenButton label="Open" node={modalNode("welcome", "Welcome")} />
      </ModalHostProvider>,
      registry,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    fireModalEvent(LATTICE_EVENT.closeModal, { modal: "other" });

    expect(screen.getByText("Welcome")).toBeInTheDocument();
  });

  it("replaces an already-open entry with the same node id instead of stacking a duplicate", () => {
    renderWithRegistry(
      <ModalHostProvider>
        <OpenButton label="Open v1" node={modalNode("welcome", "Welcome v1")} />
        <OpenButton label="Open v2" node={modalNode("welcome", "Welcome v2")} />
      </ModalHostProvider>,
      registry,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open v1" }));
    fireEvent.click(screen.getByRole("button", { name: "Open v2", hidden: true }));

    expect(screen.getAllByRole("dialog", { name: "Welcome v2" })).toHaveLength(1);
    expect(screen.queryByText("Welcome v1")).not.toBeInTheDocument();
  });

  it("renders an element entry under the embedded modal context and lets it close itself", () => {
    renderWithRegistry(
      <ModalHostProvider>
        <OpenElementButton label="Open element" title="Element dialog" />
      </ModalHostProvider>,
      registry,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open element" }));
    expect(screen.getByRole("dialog", { name: "Element dialog" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close Element dialog" }));

    expect(screen.queryByRole("dialog", { name: "Element dialog" })).not.toBeInTheDocument();
  });

  it("stacks an element overlay above an open node modal; closing the overlay leaves the modal open", () => {
    renderWithRegistry(
      <ModalHostProvider>
        <OpenButton label="Open modal" node={modalNode("welcome", "Welcome")} />
        <OpenElementButton label="Open overlay" title="Overlay dialog" />
      </ModalHostProvider>,
      registry,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open modal" }));
    expect(screen.getByText("Welcome")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open overlay", hidden: true }));
    expect(
      screen.getByRole("dialog", { name: "Overlay dialog", hidden: true }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close Overlay dialog", hidden: true }));

    expect(
      screen.queryByRole("dialog", { name: "Overlay dialog", hidden: true }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Welcome")).toBeInTheDocument();
  });

  it("removes an entry from the DOM after it closes, and a subsequent open still works", () => {
    renderWithRegistry(
      <ModalHostProvider>
        <OpenButton label="Open" node={modalNode("welcome", "Welcome")} />
      </ModalHostProvider>,
      registry,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Welcome")).toBeInTheDocument();

    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(screen.queryByText("Welcome")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Welcome")).toBeInTheDocument();
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
