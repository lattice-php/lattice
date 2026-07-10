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
        color: "default",
        size: "sm",
        text: "Manuel Christlieb",
      },
      type: "text",
    });

    render(<TextComponent node={node}>{null}</TextComponent>);

    expect(screen.getByText("Manuel Christlieb")).toHaveClass(
      "m-0",
      "text-center",
      "text-lt-fg",
      "text-sm",
    );
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

    expect(screen.getByText("Helper text")).toHaveClass("text-lt-muted-fg");
  });
});
