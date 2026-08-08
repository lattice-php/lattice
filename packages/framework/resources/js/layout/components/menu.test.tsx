import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import type { Node } from "@lattice-php/core/types";
import MenuComponent from "./menu";
import MenuItemComponent from "./menu-item";

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock({
    usePage: vi.fn<() => { url: string }>(() => ({ url: "/products" })),
    Link: ({
      children,
      href,
      method,
      as,
      ...rest
    }: {
      children: React.ReactNode;
      href: string;
      method?: string;
      as?: string;
    }) => (
      <a data-method={method} data-as={as} href={href} {...rest}>
        {children}
      </a>
    ),
  }),
);

const registry = createRegistry({
  components: {
    menu: eagerComponent(MenuComponent),
    "menu-item": eagerComponent(MenuItemComponent),
  },
  name: "test/menu",
});

function renderMenu(node: Node) {
  return renderWithRegistry(<Renderer nodes={[node]} />, registry);
}

const menu: Node = {
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
  it("marks the item matching the current url as active", () => {
    renderMenu(menu);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Products" })).toHaveAttribute("aria-current", "page");
  });

  it("renders a non-link item with children as a collapsed toggle", () => {
    renderMenu(menu);

    const toggle = screen.getByRole("button", { name: "Account" });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Account" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Profile" })).not.toBeInTheDocument();
  });

  it("expands the submenu when the toggle is clicked", () => {
    renderMenu(menu);

    fireEvent.click(screen.getByRole("button", { name: "Account" }));

    expect(screen.getByRole("button", { name: "Account" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/profile");
  });

  it("opens a group that contains the active route by default", () => {
    renderMenu({
      id: "main",
      type: "menu",
      schema: [
        {
          id: "i-catalog",
          props: { label: "Catalog" },
          schema: [
            {
              id: "i-products",
              props: { href: "/products", label: "Products" },
              type: "menu-item",
            },
          ],
          type: "menu-item",
        },
      ],
    });

    expect(screen.getByRole("button", { name: "Catalog" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("link", { name: "Products" })).toHaveAttribute("href", "/products");
  });

  it("renders an icon-only item with the label as its accessible name only", () => {
    renderMenu({
      id: "main",
      type: "menu",
      schema: [
        {
          id: "i-settings",
          props: { href: "/settings", label: "Settings", icon: "settings" },
          type: "menu-item",
        },
      ],
    });

    const link = screen.getByRole("link", { name: "Settings" });
    expect(link).toHaveAttribute("aria-label", "Settings");
    expect(link.querySelector("svg")).not.toBeNull();
  });

  it("renders a non-get item as an actionable button link", () => {
    renderMenu({
      id: "main",
      type: "menu",
      schema: [
        {
          id: "i-logout",
          props: { href: "/logout", label: "Log out", method: "post" },
          type: "menu-item",
        },
      ],
    });

    const link = screen.getByRole("link", { name: "Log out" });
    expect(link).toHaveAttribute("data-method", "post");
    expect(link).toHaveAttribute("data-as", "button");
  });
});
