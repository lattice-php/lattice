import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActionMenuProvider } from "@lattice-php/lattice/action";
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

    expect(screen.getByRole("link", { name: "Edit" })).toHaveClass(
      "h-lt-control-sm",
      "w-full",
      "no-underline",
    );
  });

  it("renders prefix and suffix affixes around the label", () => {
    const node = fakeNode({
      props: {
        href: "/docs",
        label: "Docs",
        prefix: { icon: "book-open", text: null },
        suffix: { icon: null, text: "new" },
      },
      type: "link",
    });

    render(<LinkComponent node={node}>{null}</LinkComponent>);

    const link = screen.getByRole("link", { name: "Docs new" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link.querySelector("svg")).not.toBeNull();
    expect(screen.getByText("new")).toBeVisible();
  });

  it("renders icon-only links with the label as their accessible name", () => {
    const node = fakeNode({
      props: {
        href: "/settings",
        icon: "settings",
        label: "Settings",
      },
      type: "link",
    });

    render(<LinkComponent node={node}>{null}</LinkComponent>);

    const link = screen.getByRole("link", { name: "Settings" });
    expect(link).toHaveAttribute("aria-label", "Settings");
    expect(link.querySelector("svg")).not.toBeNull();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
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
