import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice/lattice/core/registry";
import { Renderer } from "@lattice/lattice/core/renderer";
import type { Node } from "@lattice/lattice/core/types";
import MenuItemComponent from "./menu-item";
import UserMenuComponent from "./user-menu";

vi.mock("@inertiajs/react", () => ({
  usePage: vi.fn(() => ({ url: "/" })),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const { components: registry } = createRegistry({
  components: {
    "menu-item": eagerComponent(MenuItemComponent),
    "user-menu": eagerComponent(UserMenuComponent),
  },
  name: "test/user-menu",
});

function renderUserMenu(props: Record<string, unknown>) {
  const node: Node = {
    id: "u1",
    type: "user-menu",
    props,
    schema: [{ id: "i", props: { href: "/logout", label: "Log out" }, type: "menu-item" }],
  };
  return render(<Renderer nodes={[node]} registry={registry} />);
}

describe("UserMenu", () => {
  it("shows the name and falls back to initials with no avatar", () => {
    renderUserMenu({ name: "Ada Lovelace" });

    expect(screen.getByText("Ada Lovelace")).toBeVisible();
    expect(screen.getByText("AL")).toBeVisible();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders an avatar image when a url is provided", () => {
    renderUserMenu({ name: "Ada Lovelace", avatar: "https://example.com/a.png" });

    expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/a.png");
  });

  it("opens the menu when the trigger is clicked", () => {
    renderUserMenu({ name: "Ada Lovelace", email: "ada@example.com" });

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("link", { name: "Log out" })).toHaveAttribute("href", "/logout");
  });
});
