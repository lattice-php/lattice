import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { Disclosure } from "./disclosure";

describe("Disclosure in a browser", () => {
  it("honors its default state and toggles with native keyboard and pointer input", async () => {
    const screen = await render(
      <Disclosure defaultOpen summary="Schema">
        <p>Schema fields</p>
      </Disclosure>,
    );

    const disclosure = screen.container.querySelector("details");
    const summary = screen.getByText("Schema", { exact: true }).element().closest("summary");
    const content = screen.getByText("Schema fields");

    expect(summary).not.toBeNull();
    expect(disclosure?.open).toBe(true);
    await expect.element(content).toBeVisible();

    await userEvent.tab();
    expect(document.activeElement).toBe(summary);
    await userEvent.keyboard("{Enter}");

    await expect.poll(() => disclosure?.open).toBe(false);
    await expect.element(content).not.toBeVisible();

    await userEvent.click(summary!);

    await expect.poll(() => disclosure?.open).toBe(true);
    await expect.element(content).toBeVisible();
  });
});
