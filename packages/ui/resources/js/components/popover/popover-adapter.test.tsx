import { fireEvent, screen } from "@testing-library/react";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { fakeNode, renderWithRegistry } from "@lattice-php/core/test-support";
import { describe, expect, it } from "vitest";
import BadgeAdapter from "../badge/badge-adapter";
import PopoverAdapter from "./popover-adapter";

const registry = createRegistry({
  components: { badge: eagerComponent(BadgeAdapter), popover: eagerComponent(PopoverAdapter) },
  name: "test/popover-adapter",
});

describe("PopoverAdapter", () => {
  it("maps the wire trigger, identity, label, and schema body onto the popover", () => {
    const node = fakeNode({
      key: "user-card",
      props: {
        label: "User details",
        trigger: [{ props: { label: "Details" }, type: "badge" }],
      },
      type: "popover",
    });

    renderWithRegistry(
      <PopoverAdapter node={node}>
        <p>Card body</p>
      </PopoverAdapter>,
      registry,
    );

    const trigger = screen.getByRole("button", { name: "User details" });

    expect(trigger).toHaveAttribute("data-test", "user-card-trigger");
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.queryByText("Card body")).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(screen.getByText("Card body")).toBeInTheDocument();
  });
});
