import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { Collapsible } from "./collapsible";

describe("Collapsible in a browser", () => {
  it("renders flow content in its trigger and toggles with keyboard and pointer input", async () => {
    const screen = await render(
      <Collapsible
        defaultOpen
        trigger={
          <div>
            <p>Schema</p>
            <p>Current version</p>
          </div>
        }
      >
        <p>Schema fields</p>
      </Collapsible>,
    );

    const trigger = screen
      .getByText("Schema", { exact: true })
      .element()
      .closest('[role="button"]');
    const content = screen.getByText("Schema fields");

    expect(trigger).not.toBeNull();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect.element(content).toBeVisible();

    await userEvent.tab();
    expect(document.activeElement).toBe(trigger);
    await userEvent.keyboard("{Enter}");

    await expect.poll(() => trigger?.getAttribute("aria-expanded")).toBe("false");
    await expect.element(content).not.toBeInTheDocument();

    await userEvent.click(trigger!);

    await expect.poll(() => trigger?.getAttribute("aria-expanded")).toBe("true");
    const reopenedContent = screen.getByText("Schema fields");
    await expect.element(reopenedContent).toBeVisible();

    await userEvent.keyboard(" ");

    await expect.poll(() => trigger?.getAttribute("aria-expanded")).toBe("false");
    await expect.element(reopenedContent).not.toBeInTheDocument();
  });

  it("opens its tooltip without toggling", async () => {
    const screen = await render(
      <Collapsible tooltip="Reveals the edit form." trigger={<p>Name</p>}>
        <p>Hidden body</p>
      </Collapsible>,
    );

    const trigger = screen.getByText("Name", { exact: true }).element().closest('[role="button"]');
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(screen.getByRole("button", { exact: true, name: "More information" }));

    await expect.element(screen.getByText("Reveals the edit form.")).toBeVisible();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
