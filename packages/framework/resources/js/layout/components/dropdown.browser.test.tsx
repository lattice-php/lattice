import { vi } from "vitest";
vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock(),
);

import { describe, expect, it } from "vitest";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import type { Node } from "@lattice-php/core/types";
import RawBlockComponent from "@lattice-php/ui/components/raw-block/raw-block-adapter";
import TextAdapter from "@lattice-php/ui/components/text/text-adapter";
import { CollapsedProvider } from "@lattice-php/core/collapsed-context";
import DropdownComponent from "./dropdown";
import MenuItemComponent from "./menu-item";

const registry = createRegistry({
  components: {
    dropdown: eagerComponent(DropdownComponent),
    "menu-item": eagerComponent(MenuItemComponent),
    "raw-block": eagerComponent(RawBlockComponent),
    text: eagerComponent(TextAdapter),
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

describe("Dropdown in a browser", () => {
  it("hides its items until the trigger is clicked", async () => {
    const screen = await renderWithRegistry(<Renderer nodes={[node]} />, registry);

    await expect.element(screen.getByRole("link", { name: "Profile" })).not.toBeInTheDocument();

    await screen.getByRole("button", { name: "Account" }).click();

    const profile = screen.getByRole("link", { name: "Profile" });
    await expect.element(profile).toBeVisible();
    expect(profile.element()).toHaveAttribute("href", "/profile");
  });

  it("renders trigger nodes through the registry and hides collapsed trigger parts", async () => {
    const screen = await renderWithRegistry(
      <CollapsedProvider collapsed={true}>
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
      </CollapsedProvider>,
      registry,
    );

    const trigger = screen.getByRole("button", { name: "Account" });
    await expect.element(screen.getByText("Account")).not.toBeInTheDocument();
    await expect.element(screen.getByText("AL")).toBeVisible();

    await trigger.click();
    await expect
      .element(screen.getByRole("link", { name: "Profile" }))
      .toHaveAttribute("href", "/profile");
  });
});
