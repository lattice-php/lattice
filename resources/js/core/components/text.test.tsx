import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice/lattice/test-support";
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
});
