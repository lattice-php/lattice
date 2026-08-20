import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";
import { createRegistry, eagerComponent } from "@lattice-php/core/registry";
import { renderWithRegistry } from "@lattice-php/core/browser-test-support";
import { fakeNode } from "@lattice-php/core/test-support";
import BadgeAdapter from "../badge/badge-adapter";
import PopoverAdapter from "./popover-adapter";

const registry = createRegistry({
  components: { badge: eagerComponent(BadgeAdapter), popover: eagerComponent(PopoverAdapter) },
  name: "test/popover-adapter-browser",
});

describe("PopoverAdapter in a browser", () => {
  it("opens the popover content when the trigger is clicked, and closes it on outside click", async () => {
    const node = fakeNode({
      key: "user-card",
      props: { trigger: [{ props: { label: "Details" }, type: "badge" }] },
      type: "popover",
    });

    const screen = await renderWithRegistry(
      <div>
        <PopoverAdapter node={node}>
          <p>Card body</p>
        </PopoverAdapter>
        <p>Outside</p>
      </div>,
      registry,
    );

    const trigger = screen.getByRole("button", { name: "Details" });

    await expect.element(screen.getByText("Card body")).not.toBeInTheDocument();

    await userEvent.click(trigger);

    await expect.element(screen.getByText("Card body")).toBeVisible();

    await userEvent.click(screen.getByText("Outside"));

    await expect.element(screen.getByText("Card body")).not.toBeInTheDocument();
  });
});
