import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import { createRegistry } from "@lattice-php/lattice/core/registry";
import { RegistryContext } from "@lattice-php/lattice/core/registry-context";
import { uiComponents } from "./plugin";
import FloatingPanelComponent from "./floating-panel";

describe("Floating panel", () => {
  it("renders children in a labelled fixed viewport panel", () => {
    const node = fakeNode({
      key: "locale-switcher-panel",
      props: {
        label: "Language",
        offset: 24,
        placement: "bottom-end",
      },
      type: "floating-panel",
    });

    const { container } = render(
      <FloatingPanelComponent node={node}>
        <button type="button">English</button>
      </FloatingPanelComponent>,
    );

    const panel = screen.getByRole("group", { name: "Language" });

    expect(panel).toHaveClass("fixed");
    expect(panel).toHaveStyle({ bottom: "24px", right: "24px" });
    expect(container.querySelector('[data-lattice-component="locale-switcher-panel"]')).toBe(panel);
    expect(screen.getByRole("button", { name: "English" })).toBeVisible();
  });

  it("supports top-start placement", () => {
    const node = fakeNode({
      props: {
        offset: 12,
        placement: "top-start",
      },
      type: "floating-panel",
    });

    const { container } = render(
      <FloatingPanelComponent node={node}>
        <span>Theme</span>
      </FloatingPanelComponent>,
    );

    expect(container.firstElementChild).toHaveStyle({ left: "12px", top: "12px" });
  });

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

    render(
      <RegistryContext.Provider value={createRegistry(uiComponents)}>
        <FloatingPanelComponent node={node}>
          <section>Conversation</section>
        </FloatingPanelComponent>
      </RegistryContext.Provider>,
    );

    expect(screen.getByRole("button", { name: "Chat" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Conversation").parentElement).toHaveClass("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Chat" }));

    expect(screen.getByRole("button", { name: "Chat" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Conversation").parentElement).toHaveClass("block");
  });
});
