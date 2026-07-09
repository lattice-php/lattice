import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/lattice/core/registry";
import { Renderer } from "@lattice-php/lattice/core/renderer";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import type { Node } from "@lattice-php/lattice/core/types";
import RawBlockComponent from "@lattice-php/lattice/ui/raw-block";
import TextComponent from "@lattice-php/lattice/ui/text";
import { SidebarCollapsedContext } from "../hooks/context";
import DropdownComponent from "./dropdown";
import MenuItemComponent from "./menu-item";

vi.mock("@inertiajs/react", () => ({
  usePage: vi.fn<() => { url: string }>(() => ({ url: "/" })),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const registry = createRegistry({
  components: {
    dropdown: eagerComponent(DropdownComponent),
    "menu-item": eagerComponent(MenuItemComponent),
    "raw-block": eagerComponent(RawBlockComponent),
    text: eagerComponent(TextComponent),
  },
  name: "test/dropdown",
});

const node: Node = {
  key: "account-menu",
  type: "dropdown",
  props: {
    placement: "bottom",
    trigger: [{ props: { text: "Account" }, type: "text" }],
  },
  schema: [{ id: "i", props: { href: "/profile", label: "Profile" }, type: "menu-item" }],
};

describe("Dropdown", () => {
  it("hides its items until the trigger is clicked", () => {
    renderWithRegistry(<Renderer nodes={[node]} />, registry);

    expect(screen.queryByRole("link", { name: "Profile" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Account" }));

    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/profile");
  });

  it("renders trigger nodes through the registry and hides collapsed trigger parts", () => {
    renderWithRegistry(
      <SidebarCollapsedContext.Provider value={true}>
        <Renderer
          nodes={[
            {
              ...node,
              props: {
                placement: "right",
                trigger: [
                  { props: { html: '<span aria-label="Account">AL</span>' }, type: "raw-block" },
                  { props: { hideWhenCollapsed: true, text: "Account" }, type: "text" },
                ],
              },
            },
          ]}
        />
      </SidebarCollapsedContext.Provider>,
      registry,
    );

    const trigger = screen.getByRole("button", { name: "Account" });
    expect(screen.queryByText("Account")).not.toBeInTheDocument();
    expect(screen.getByText("AL")).toBeVisible();

    fireEvent.click(trigger);
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/profile");
  });
});
