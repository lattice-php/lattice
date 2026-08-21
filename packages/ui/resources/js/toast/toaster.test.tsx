import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import { LinkAdapter } from "../components/link/link-adapter";
import { Toaster } from "./toaster";

const registry = createRegistry({
  components: { link: eagerComponent(LinkAdapter) },
  name: "test/toaster",
});

function emit(toast: unknown): void {
  act(() => {
    window.dispatchEvent(new CustomEvent(LATTICE_EVENT.toast, { detail: toast }));
  });
}

describe("Toaster", () => {
  it("renders a toast dispatched on the lattice toast event", () => {
    render(<Toaster />);

    emit({ message: "Saved.", variant: "success" });

    expect(screen.getByText("Saved.")).toBeVisible();
  });

  it("ignores payloads without a message", () => {
    render(<Toaster />);

    emit({ variant: "success" });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("dismisses a toast via the close button", () => {
    render(<Toaster />);

    emit({ message: "Saved.", variant: "success" });
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(screen.queryByText("Saved.")).not.toBeInTheDocument();
  });

  it("renders a link action inside the toast", () => {
    renderWithRegistry(<Toaster />, registry);

    emit({
      message: "Archived.",
      variant: "success",
      persistent: true,
      action: { type: "link", props: { label: "Undo", href: "/undo" } },
    });

    expect(screen.getByRole("link", { name: "Undo" })).toHaveAttribute("href", "/undo");
  });

  it("renders a Translatable message by resolving it to its key when no catalog is loaded", () => {
    render(<Toaster />);

    emit({ message: { key: "orders.created", payload: {}, replacements: {} }, variant: "success" });

    expect(screen.getByText("orders.created")).toBeVisible();
  });
});
