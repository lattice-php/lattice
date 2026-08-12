import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { beforeEach, describe, expect, it } from "vitest";
import { fakeNode } from "@lattice-php/core/test-support";
import DescriptionListComponent from "./description-list";
import { TextEntryComponent } from "../entries";

describe("DescriptionList in a browser", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("reveals and hides an entry's disclosure content when its row is used", async () => {
    const screen = await render(
      <DescriptionListComponent
        node={fakeNode({ type: "description-list", id: "security", props: { semantic: "list" } })}
      >
        <TextEntryComponent
          node={fakeNode({
            type: "entry.text",
            id: "entry-password",
            props: { label: "Password", value: "••••••••" },
            schema: [fakeNode({ type: "text", props: { text: "Change your password" } })],
          })}
        >
          <p>Change your password</p>
        </TextEntryComponent>
      </DescriptionListComponent>,
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
