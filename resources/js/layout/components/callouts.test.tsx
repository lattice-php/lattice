import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { vi } from "vitest";
import { LATTICE_EVENT } from "@lattice-php/lattice/core/event-names";
import { Provider } from "@lattice-php/lattice/provider";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import { fakeNode } from "@lattice-php/lattice/test-support";

const navigateListeners: Array<() => void> = [];

vi.mock("@inertiajs/react", async () => {
  const { inertiaMock } = await import("@lattice-php/lattice/test/inertia-mock");

  return inertiaMock({
    router: {
      on: (event: string, listener: () => void) => {
        if (event === "navigate") {
          navigateListeners.push(listener);
        }

        return () => undefined;
      },
      reload: vi.fn(),
      visit: vi.fn(),
    },
  });
});

function navigate(): void {
  act(() => {
    for (const listener of navigateListeners) {
      listener();
    }
  });
}

function emitCallout(
  message: string,
  options: { dismissible?: boolean; action?: unknown; unique?: string } = {},
): void {
  act(() => {
    window.dispatchEvent(
      new CustomEvent(LATTICE_EVENT.callout, {
        detail: {
          variant: "warning",
          title: "Heads up",
          message,
          dismissible: options.dismissible ?? true,
          action: options.action ?? null,
          unique: options.unique ?? null,
        },
      }),
    );
  });
}

function retractCallout(unique: string): void {
  act(() => {
    window.dispatchEvent(
      new CustomEvent(LATTICE_EVENT.retractCallout, {
        detail: { unique },
      }),
    );
  });
}

describe("Callouts slot", () => {
  beforeEach(() => {
    navigateListeners.length = 0;
  });

  it("renders callouts emitted on the bus and dismisses them", () => {
    render(
      <Provider toaster={false}>
        <Renderer nodes={[fakeNode({ type: "callouts", id: "c", props: {} })]} />
      </Provider>,
    );

    emitCallout("Trial ends soon");
    expect(screen.getByText("Trial ends soon")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Trial ends soon")).not.toBeInTheDocument();
  });

  it("omits the dismiss button when the callout is not dismissible", () => {
    render(
      <Provider toaster={false}>
        <Renderer nodes={[fakeNode({ type: "callouts", id: "c", props: {} })]} />
      </Provider>,
    );

    emitCallout("Storage almost full", { dismissible: false });

    expect(screen.getByText("Storage almost full")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
  });

  it("resolves a translatable message and title to their keys when no catalog is loaded", () => {
    render(
      <Provider toaster={false}>
        <Renderer nodes={[fakeNode({ type: "callouts", id: "c", props: {} })]} />
      </Provider>,
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent(LATTICE_EVENT.callout, {
          detail: {
            variant: "warning",
            title: { key: "billing.trial-ending-title", payload: {}, replacements: {} },
            message: { key: "billing.trial-ending", payload: {}, replacements: {} },
          },
        }),
      );
    });

    expect(screen.getByText("billing.trial-ending-title")).toBeInTheDocument();
    expect(screen.getByText("billing.trial-ending")).toBeInTheDocument();
  });

  it("renders a link action inside the callout", () => {
    render(
      <Provider toaster={false}>
        <Renderer nodes={[fakeNode({ type: "callouts", id: "c", props: {} })]} />
      </Provider>,
    );

    emitCallout("Archived.", {
      action: { type: "link", props: { label: "Undo", href: "/undo" } },
    });

    expect(screen.getByRole("link", { name: "Undo" })).toHaveAttribute("href", "/undo");
  });

  it("replaces a keyed callout instead of stacking it", () => {
    render(
      <Provider toaster={false}>
        <Renderer nodes={[fakeNode({ type: "callouts", id: "c", props: {} })]} />
      </Provider>,
    );

    emitCallout("Payment failed", { unique: "billing.state" });
    emitCallout("Payment failed", { unique: "billing.state" });
    emitCallout("Payment failed", { unique: "billing.state" });

    expect(screen.getAllByText("Payment failed")).toHaveLength(1);
  });

  it("keeps unkeyed callouts stacking", () => {
    render(
      <Provider toaster={false}>
        <Renderer nodes={[fakeNode({ type: "callouts", id: "c", props: {} })]} />
      </Provider>,
    );

    emitCallout("Archived.");
    emitCallout("Archived.");

    expect(screen.getAllByText("Archived.")).toHaveLength(2);
  });

  it("drops keyed callouts on navigation and keeps unkeyed ones", () => {
    render(
      <Provider toaster={false}>
        <Renderer nodes={[fakeNode({ type: "callouts", id: "c", props: {} })]} />
      </Provider>,
    );

    emitCallout("Payment failed", { unique: "billing.state" });
    emitCallout("Archived.");

    navigate();

    expect(screen.queryByText("Payment failed")).not.toBeInTheDocument();
    expect(screen.getByText("Archived.")).toBeInTheDocument();
  });

  it("drops a keyed callout when its key is retracted", () => {
    render(
      <Provider toaster={false}>
        <Renderer nodes={[fakeNode({ type: "callouts", id: "c", props: {} })]} />
      </Provider>,
    );

    emitCallout("Payment failed", { unique: "billing.state" });

    retractCallout("billing.state");

    expect(screen.queryByText("Payment failed")).not.toBeInTheDocument();
  });

  it("leaves a different key alone when retracting", () => {
    render(
      <Provider toaster={false}>
        <Renderer nodes={[fakeNode({ type: "callouts", id: "c", props: {} })]} />
      </Provider>,
    );

    emitCallout("Payment failed", { unique: "billing.state" });
    emitCallout("Read-only mode", { unique: "maintenance.mode" });

    retractCallout("billing.state");

    expect(screen.queryByText("Payment failed")).not.toBeInTheDocument();
    expect(screen.getByText("Read-only mode")).toBeInTheDocument();
  });

  it("leaves an unkeyed callout alone when retracting", () => {
    render(
      <Provider toaster={false}>
        <Renderer nodes={[fakeNode({ type: "callouts", id: "c", props: {} })]} />
      </Provider>,
    );

    emitCallout("Archived.");

    retractCallout("billing.state");

    expect(screen.getByText("Archived.")).toBeInTheDocument();
  });
});
