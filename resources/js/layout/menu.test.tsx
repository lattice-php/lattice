import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice/lattice/core/registry";
import { Renderer } from "@lattice/lattice/core/renderer";
import type { Node } from "@lattice/lattice/core/types";
import MenuComponent from "./menu";
import MenuItemComponent from "./menu-item";

vi.mock("@inertiajs/react", () => ({
  usePage: vi.fn<() => { url: string }>(() => ({ url: "/products" })),
  Link: ({
    children,
    href,
    method,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    method?: string;
  }) => (
    <a data-method={method} href={href} {...rest}>
      {children}
    </a>
  ),
}));

const registry = createRegistry({
  components: {
    menu: eagerComponent(MenuComponent),
    "menu-item": eagerComponent(MenuItemComponent),
  },
  name: "test/menu",
});

function renderMenu(node: Node<"menu">) {
  return render(<Renderer nodes={[node]} registry={registry} />);
}

const menu: Node<"menu"> = {
  id: "main",
  type: "menu",
  schema: [
    { id: "i-home", props: { href: "/", label: "Home" }, type: "menu-item" },
    {
      id: "i-products",
      props: { href: "/products", label: "Products", method: "get" },
      type: "menu-item",
    },
    {
      id: "i-account",
      props: { label: "Account" },
      schema: [
        { id: "i-profile", props: { href: "/profile", label: "Profile" }, type: "menu-item" },
      ],
      type: "menu-item",
    },
  ],
};

describe("Menu", () => {
  it("renders a navigation with a link per item", () => {
    renderMenu(menu);

    expect(screen.getByRole("navigation")).toBeVisible();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Products" })).toHaveAttribute("href", "/products");
  });

  it("marks the item matching the current url as active", () => {
    renderMenu(menu);

    expect(screen.getByRole("link", { name: "Products" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });

  it("renders an item without an href as a plain label", () => {
    renderMenu(menu);

    expect(screen.getByText("Account")).toBeVisible();
    expect(screen.queryByRole("link", { name: "Account" })).not.toBeInTheDocument();
  });

  it("renders nested children of an item", () => {
    renderMenu(menu);

    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/profile");
  });
});
