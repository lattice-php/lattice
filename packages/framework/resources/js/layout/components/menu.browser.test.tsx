import { vi } from "vitest";
vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock(),
);

import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import type { ComponentRenderOptions } from "vitest-browser-react";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import { RegistryContext } from "@lattice-php/core/registry-context";
import type { Node } from "@lattice-php/core/types";
import { SidebarCollapsedContext } from "@lattice-php/lattice/layout/hooks/context";
import MenuComponent from "./menu";
import MenuItemComponent from "./menu-item";

const registry = createRegistry({
  components: {
    menu: eagerComponent(MenuComponent),
    "menu-item": eagerComponent(MenuItemComponent),
  },
  name: "test/menu",
});

const withRegistry: ComponentRenderOptions = {
  wrapper: ({ children }) => (
    <RegistryContext.Provider value={registry}>{children}</RegistryContext.Provider>
  ),
};

const menu: Node = {
  id: "main",
  type: "menu",
  schema: [
    { id: "i-home", props: { href: "/", label: "Home" }, type: "menu-item" },
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

function renderCollapsedMenu() {
  return render(
    <SidebarCollapsedContext.Provider value={true}>
      <Renderer nodes={[menu]} />
    </SidebarCollapsedContext.Provider>,
    withRegistry,
  );
}

describe("Menu in a collapsed sidebar", () => {
  it("opens a group's submenu as a flyout when the sidebar is collapsed", async () => {
    const screen = await renderCollapsedMenu();

    await expect.element(screen.getByRole("link", { name: "Profile" })).not.toBeInTheDocument();

    await screen.getByRole("button", { name: "Account" }).click();

    const profile = screen.getByRole("link", { name: "Profile" });
    await expect.element(profile).toBeVisible();
    expect(profile.element()).toHaveAttribute("href", "/profile");
  });

  it("keeps a collapsed leaf item's label reachable as a hover flyout", async () => {
    const screen = await renderCollapsedMenu();

    const label = screen.getByText("Home");
    await expect.element(label).not.toBeVisible();

    await screen.getByRole("link", { name: "Home" }).hover();

    await expect.element(label).toBeVisible();
  });
});
