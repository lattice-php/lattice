import { act, fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { LATTICE_EVENT } from "@lattice-php/core/event-names";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { fakeNode, renderWithRegistry } from "@lattice-php/core/test-support";
import { defaultNavigation, NavigationProvider } from "../../navigation";
import LinkAdapter from "../link/link-adapter";
import CalloutsAdapter from "./callouts-adapter";

const navigateListeners: Array<() => void> = [];

const navigation = {
  ...defaultNavigation,
  onNavigate: (listener: () => void) => {
    navigateListeners.push(listener);

    return () => undefined;
  },
};

const registry = createRegistry({
  components: {
    callouts: eagerComponent(CalloutsAdapter),
    link: eagerComponent(LinkAdapter),
  },
  name: "test/callouts",
});

function renderCallouts() {
  return renderWithRegistry(
    <NavigationProvider adapter={navigation}>
      <Renderer nodes={[fakeNode({ type: "callouts", id: "c", props: {} })]} />
    </NavigationProvider>,
    registry,
  );
}

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
    window.dispatchEvent(new CustomEvent(LATTICE_EVENT.retractCallout, { detail: { unique } }));
  });
}

describe("CalloutsAdapter", () => {
  beforeEach(() => {
    navigateListeners.length = 0;
  });

  it("renders callouts emitted on the bus and dismisses them", () => {
    renderCallouts();

    emitCallout("Trial ends soon");
    expect(screen.getByText("Trial ends soon")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Trial ends soon")).not.toBeInTheDocument();
  });

  it("omits the dismiss button when the callout is not dismissible", () => {
    renderCallouts();

    emitCallout("Storage almost full", { dismissible: false });

    expect(screen.getByText("Storage almost full")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
  });

  it("resolves a translatable message and title to their keys when no catalog is loaded", () => {
    renderCallouts();

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
    renderCallouts();

    emitCallout("Archived.", {
      action: { type: "link", props: { label: "Undo", href: "/undo" } },
    });

    expect(screen.getByRole("link", { name: "Undo" })).toHaveAttribute("href", "/undo");
  });

  it("marks the list with the node identity", () => {
    renderCallouts();

    emitCallout("Archived.");

    expect(screen.getByRole("status").parentElement).toHaveAttribute("data-test", "c");
  });

  it("replaces a keyed callout instead of stacking it", () => {
    renderCallouts();

    emitCallout("Payment failed", { unique: "billing.state" });
    emitCallout("Payment failed", { unique: "billing.state" });
    emitCallout("Payment failed", { unique: "billing.state" });

    expect(screen.getAllByText("Payment failed")).toHaveLength(1);
  });

  it("keeps unkeyed callouts stacking", () => {
    renderCallouts();

    emitCallout("Archived.");
    emitCallout("Archived.");

    expect(screen.getAllByText("Archived.")).toHaveLength(2);
  });

  it("drops keyed callouts on navigation and keeps unkeyed ones", () => {
    renderCallouts();

    emitCallout("Payment failed", { unique: "billing.state" });
    emitCallout("Archived.");

    navigate();

    expect(screen.queryByText("Payment failed")).not.toBeInTheDocument();
    expect(screen.getByText("Archived.")).toBeInTheDocument();
  });

  it("drops a keyed callout when its key is retracted", () => {
    renderCallouts();

    emitCallout("Payment failed", { unique: "billing.state" });

    retractCallout("billing.state");

    expect(screen.queryByText("Payment failed")).not.toBeInTheDocument();
  });

  it("leaves a different key alone when retracting", () => {
    renderCallouts();

    emitCallout("Payment failed", { unique: "billing.state" });
    emitCallout("Read-only mode", { unique: "maintenance.mode" });

    retractCallout("billing.state");

    expect(screen.queryByText("Payment failed")).not.toBeInTheDocument();
    expect(screen.getByText("Read-only mode")).toBeInTheDocument();
  });

  it("leaves an unkeyed callout alone when retracting", () => {
    renderCallouts();

    emitCallout("Archived.");

    retractCallout("billing.state");

    expect(screen.getByText("Archived.")).toBeInTheDocument();
  });
});
