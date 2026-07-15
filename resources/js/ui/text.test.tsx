import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import TextComponent from "./text";

describe("Lattice text component", () => {
  it("renders text without coupling links into the text component", () => {
    const node = fakeNode({
      props: {
        text: "Don't have an account?",
      },
      type: "text",
    });

    render(<TextComponent node={node}>{null}</TextComponent>);

    expect(screen.getByText("Don't have an account?")).toBeVisible();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders configured size and color classes", () => {
    const node = fakeNode({
      props: {
        align: "center",
        color: { kind: "named", value: "default", dark: null },
        size: "sm",
        text: "Manuel Christlieb",
      },
      type: "text",
    });

    render(<TextComponent node={node}>{null}</TextComponent>);

    const text = screen.getByText("Manuel Christlieb");
    expect(text).toHaveClass("m-0", "text-center", "text-sm");
    expect(text.style.getPropertyValue("color")).toBe("var(--lt-color-default)");
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
