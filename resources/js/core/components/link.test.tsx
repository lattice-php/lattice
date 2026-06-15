import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActionMenuProvider } from "@lattice-php/lattice/action/components/action-menu-context";
import { fakeNode } from "@lattice-php/lattice/test-support";
import LinkComponent, { TextLink } from "./link";

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

  it("renders as a subtle menu item inside action menus", () => {
    const node = fakeNode({
      props: {
        href: "/products/1/edit",
        label: "Edit",
      },
      type: "link",
    });

    render(
      <ActionMenuProvider>
        <LinkComponent node={node}>{null}</LinkComponent>
      </ActionMenuProvider>,
    );

    expect(screen.getByRole("link", { name: "Edit" })).toHaveClass("h-8", "w-full", "no-underline");
  });

  it("merges custom classes on direct text links", () => {
    render(
      <TextLink className="custom-class" href="/docs">
        Docs
      </TextLink>,
    );

    expect(screen.getByRole("link", { name: "Docs" })).toHaveClass("custom-class");
  });
});
