import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { createRegistry } from "@lattice-php/core/registry";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import { uiComponents } from "../plugin";
import FloatingPanelComponent from "./floating-panel";

describe("Floating panel", () => {
  it("renders trigger content and toggles the floating panel body", () => {
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
      <FloatingPanelComponent node={node}>
        <section>Conversation</section>
      </FloatingPanelComponent>,
      createRegistry(uiComponents),
    );

    expect(screen.getByRole("button", { name: "Chat" })).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(screen.getByRole("button", { name: "Chat" }));

    expect(screen.getByRole("button", { name: "Chat" })).toHaveAttribute("aria-expanded", "true");
  });
});
