import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRegistry, eagerComponent } from "@lattice/lattice/core/registry";
import { Renderer } from "@lattice/lattice/core/renderer";
import type { Node } from "@lattice/lattice/core/types";
import DropdownComponent from "./dropdown";
import MenuItemComponent from "./menu-item";

vi.mock("@inertiajs/react", () => ({
  usePage: vi.fn<() => { url: string }>(() => ({ url: "/" })),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const { components: registry } = createRegistry({
  components: {
    dropdown: eagerComponent(DropdownComponent),
    "menu-item": eagerComponent(MenuItemComponent),
  },
  name: "test/dropdown",
});

const node: Node = {
  id: "d1",
  type: "dropdown",
  props: { label: "Account" },
  schema: [{ id: "i", props: { href: "/profile", label: "Profile" }, type: "menu-item" }],
};

describe("Dropdown", () => {
  it("hides its items until the trigger is clicked", () => {
    render(<Renderer nodes={[node]} registry={registry} />);

    expect(screen.queryByRole("link", { name: "Profile" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Account" }));

    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/profile");
  });
});
