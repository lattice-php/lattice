import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { vi } from "vitest";
import { LATTICE_EVENT } from "@lattice-php/lattice/core/event-names";
import { Provider } from "@lattice-php/lattice/provider";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import { fakeNode } from "@lattice-php/lattice/test-support";

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/lattice/test/inertia-mock")).inertiaMock(),
);

function emitCallout(
  message: string,
  options: { dismissible?: boolean; action?: unknown } = {},
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
        },
      }),
    );
  });
}

describe("Callouts slot", () => {
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
});
