import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { Disclosure } from "./disclosure";

describe("Disclosure in a browser", () => {
  it("renders flow content in its summary and toggles with keyboard and pointer input", async () => {
    const screen = await render(
      <Disclosure
        defaultOpen
        summary={
          <div>
            <p>Schema</p>
            <p>Current version</p>
          </div>
        }
      >
        <p>Schema fields</p>
      </Disclosure>,
    );

    const summary = screen
      .getByText("Schema", { exact: true })
      .element()
      .closest('[role="button"]');
    const content = screen.getByText("Schema fields");

    expect(summary).not.toBeNull();
    expect(summary).toHaveAttribute("aria-expanded", "true");
    await expect.element(content).toBeVisible();

    await userEvent.tab();
    expect(document.activeElement).toBe(summary);
    await userEvent.keyboard("{Enter}");

    await expect.poll(() => summary?.getAttribute("aria-expanded")).toBe("false");
    await expect.element(content).not.toBeInTheDocument();

    await userEvent.click(summary!);

    await expect.poll(() => summary?.getAttribute("aria-expanded")).toBe("true");
    const reopenedContent = screen.getByText("Schema fields");
    await expect.element(reopenedContent).toBeVisible();

    await userEvent.keyboard(" ");

    await expect.poll(() => summary?.getAttribute("aria-expanded")).toBe("false");
    await expect.element(reopenedContent).not.toBeInTheDocument();
  });
});
