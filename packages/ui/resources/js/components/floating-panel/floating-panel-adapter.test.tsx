import { fireEvent, screen } from "@testing-library/react";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { fakeNode, renderWithRegistry } from "@lattice-php/core/test-support";
import { describe, expect, it } from "vitest";
import BadgeComponent from "../badge";
import FloatingPanelAdapter from "./floating-panel-adapter";

const registry = createRegistry({
  components: { badge: eagerComponent(BadgeComponent) },
  name: "test/floating-panel",
});

describe("FloatingPanelAdapter", () => {
  it("renders a wire trigger into the client-side panel", () => {
    const node = fakeNode({
      key: "assistant-chat",
      props: {
        label: "Assistant",
        placement: "bottom-end",
        trigger: [{ type: "badge", props: { label: "Chat" } }],
      },
      type: "floating-panel",
    });

    renderWithRegistry(
      <FloatingPanelAdapter node={node}>
        <section>Conversation</section>
      </FloatingPanelAdapter>,
      registry,
    );

    const trigger = screen.getByRole("button", { name: "Chat" });

    expect(trigger).toHaveAttribute("data-test", "assistant-chat-trigger");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
