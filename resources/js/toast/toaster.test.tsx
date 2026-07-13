import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { LATTICE_EVENT } from "@lattice-php/lattice/events/event-names";
import { Provider } from "@lattice-php/lattice/provider";
import { Toaster } from "./toaster";

vi.mock("@inertiajs/react", () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  router: {
    on: vi.fn<(event: string, listener: (event: Event) => void) => () => void>(
      () => () => undefined,
    ),
  },
}));

function emit(toast: unknown): void {
  act(() => {
    window.dispatchEvent(new CustomEvent(LATTICE_EVENT.toast, { detail: toast }));
  });
}

function renderToaster() {
  return render(
    <Provider toaster={false}>
      <Toaster />
    </Provider>,
  );
}

describe("Toaster", () => {
  afterEach(() => vi.clearAllMocks());

  it("renders a toast dispatched on the lattice toast event", () => {
    renderToaster();

    emit({ message: "Saved.", variant: "success" });

    expect(screen.getByText("Saved.")).toBeVisible();
  });

  it("ignores payloads without a message", () => {
    renderToaster();

    emit({ variant: "success" });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("dismisses a toast via the close button", () => {
    renderToaster();

    emit({ message: "Saved.", variant: "success" });
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(screen.queryByText("Saved.")).not.toBeInTheDocument();
  });

  it("renders a link action inside the toast", () => {
    renderToaster();

    emit({
      message: "Archived.",
      variant: "success",
      persistent: true,
      action: { type: "link", props: { label: "Undo", href: "/undo" } },
    });

    expect(screen.getByRole("link", { name: "Undo" })).toHaveAttribute("href", "/undo");
  });

  it("renders a Translatable message by resolving it to its key when no catalog is loaded", () => {
    renderToaster();

    emit({ message: { key: "orders.created", payload: {}, replacements: {} }, variant: "success" });

    expect(screen.getByText("orders.created")).toBeVisible();
  });
});
