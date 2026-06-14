import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
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
});
