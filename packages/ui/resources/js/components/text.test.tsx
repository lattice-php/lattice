import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import TextComponent from "./text";

describe("Lattice text component", () => {
  it("renders paragraph text", () => {
    const node = fakeNode({
      props: {
        text: "Don't have an account?",
      },
      type: "text",
    });

    render(<TextComponent node={node}>{null}</TextComponent>);

    expect(screen.getByText("Don't have an account?")).toBeVisible();
  });

  it("falls back to muted styling when no color is set", () => {
    const node = fakeNode({
      props: {
        color: null,
        text: "Helper text",
      },
      type: "text",
    });

    render(<TextComponent node={node}>{null}</TextComponent>);

    expect(screen.getByText("Helper text").style.getPropertyValue("color")).toBe(
      "var(--lt-color-muted)",
    );
  });
});
