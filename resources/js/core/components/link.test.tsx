import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Node } from "@lattice/lattice/core/types";
import LinkComponent from "./link";

describe("Lattice link component", () => {
  it("renders an Inertia link from server props", () => {
    const node = {
      props: {
        href: "/register",
        label: "Sign up",
        tabIndex: 6,
      },
      type: "link",
    } satisfies Node<"link">;

    render(<LinkComponent node={node}>{null}</LinkComponent>);

    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/register");
  });
});
