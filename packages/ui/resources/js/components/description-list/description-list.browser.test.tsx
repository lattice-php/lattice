import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { beforeEach, describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import { TextEntryAdapter } from "../entries/entries";
import { DescriptionList } from "./description-list";

describe("DescriptionList in a browser", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("bleeds its divider flush to both edges of a padded parent", async () => {
    // Mirrors CardContent's own px-lt-gutter: the padded box a bled list
    // divides edge to edge in real usage.
    const screen = await render(
      <div className="px-lt-gutter" style={{ width: 400 }} data-testid="panel">
        <DescriptionList bleed semantic="list">
          <TextEntryAdapter
            node={fakeNode({
              type: "entry.text",
              id: "entry-name",
              props: { label: "Name", value: "Ada Lovelace" },
            })}
          >
            {null}
          </TextEntryAdapter>
        </DescriptionList>
      </div>,
    );

    await expect.element(screen.getByText("Ada Lovelace")).toBeVisible();

    const panel = document.querySelector('[data-testid="panel"]') as HTMLElement;
    const list = panel.querySelector('[data-slot="description-list"]') as HTMLElement;

    const panelRect = panel.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();

    expect(listRect.left).toBeCloseTo(panelRect.left, 0);
    expect(listRect.right).toBeCloseTo(panelRect.right, 0);
  });

  it("reveals and hides an entry's disclosure content when its row is used", async () => {
    const screen = await render(
      <DescriptionList semantic="list">
        <TextEntryAdapter
          node={fakeNode({
            type: "entry.text",
            id: "entry-password",
            props: { label: "Password", value: "••••••••" },
            schema: [fakeNode({ type: "text", props: { text: "Change your password" } })],
          })}
        >
          <p>Change your password</p>
        </TextEntryAdapter>
      </DescriptionList>,
    );

    const row = screen.getByRole("button", { name: /Password/ });

    await expect.element(row).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(row);

    await expect.element(screen.getByText("Change your password")).toBeVisible();
    await expect.element(row).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(row);

    await expect.element(row).toHaveAttribute("aria-expanded", "false");
    expect(screen.container.textContent).not.toContain("Change your password");
  });
});
