import { fireEvent, screen } from "@testing-library/react";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { fakeNode, renderWithRegistry } from "@lattice-php/core/test-support";
import type { RendererComponent } from "@lattice-php/core/types";
import { describe, expect, it, vi } from "vitest";
import CardAdapter from "./card-adapter";

const onAction = vi.fn();

const ActionProbe: RendererComponent = ({ node }) => (
  <button onClick={() => onAction(node.props?.label)}>{String(node.props?.label)}</button>
);

const registry = createRegistry({
  components: { action: eagerComponent(ActionProbe) },
  name: "test/card-adapter",
});

describe("Card adapter", () => {
  it("renders wire actions and trusted tooltip HTML through the client card", () => {
    const node = fakeNode({
      id: "plan",
      props: {
        description: "Monthly subscription",
        headerActions: [{ props: { label: "Edit plan" }, type: "action" }],
        title: "Plan",
        tooltip: 'Read the <a href="/billing">billing details</a>.',
      },
      type: "card",
    });

    renderWithRegistry(<CardAdapter node={node}>Professional</CardAdapter>, registry);

    fireEvent.click(screen.getByRole("button", { name: "Edit plan" }));
    expect(onAction).toHaveBeenCalledWith("Edit plan");

    fireEvent.click(screen.getByRole("button", { name: "More information" }));
    expect(screen.getByRole("link", { name: "billing details" })).toHaveAttribute(
      "href",
      "/billing",
    );
  });
});
