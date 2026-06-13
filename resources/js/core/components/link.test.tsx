import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";
import LinkComponent from "./link";

describe("Lattice link component", () => {
  it("renders an Inertia link from server props", () => {
    const node = fakeNode({
      props: {
        href: "/register",
        label: "Sign up",
        tabIndex: 6,
      },
      type: "link",
    });

    render(<LinkComponent node={node}>{null}</LinkComponent>);

    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/register");
  });
});
