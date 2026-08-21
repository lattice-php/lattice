import { describe, expect, it } from "vitest";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { Renderer } from "@lattice-php/core/renderer";
import type { Node } from "@lattice-php/core/types";
import { CollapsedProvider } from "@lattice-php/core/collapsed-context";
import LinkAdapter from "../link/link-adapter";
import RawBlockAdapter from "../raw-block/raw-block-adapter";
import TextAdapter from "../text/text-adapter";
import DropdownAdapter from "./dropdown-adapter";

const registry = createRegistry({
  components: {
    dropdown: eagerComponent(DropdownAdapter),
    link: eagerComponent(LinkAdapter),
    "raw-block": eagerComponent(RawBlockAdapter),
    text: eagerComponent(TextAdapter),
  },
  name: "test/dropdown-adapter",
});

const node: Node = {
  key: "account-menu",
  type: "dropdown",
  props: {
    placement: "bottom",
    trigger: [{ props: { text: "Account" }, type: "text" }],
  },
  schema: [{ id: "i", props: { href: "/profile", label: "Profile" }, type: "link" }],
};

describe("DropdownAdapter in a browser", () => {
  it("hides its items until the identified trigger is clicked", async () => {
    const screen = await renderWithRegistry(<Renderer nodes={[node]} />, registry);

    await expect.element(screen.getByRole("link", { name: "Profile" })).not.toBeInTheDocument();

    await screen.getByTestId("account-menu").click();

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
