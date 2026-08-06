import { vi } from "vitest";
vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/ui/test/inertia-mock")).inertiaMock(),
);

import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
import { Popover } from "./popover";

function renderPopover() {
  return render(
    <Popover trigger={<span>Open</span>} testId="pop">
      <a href="/x">Item</a>
    </Popover>,
  );
}

describe("Popover in a browser", () => {
  it("opens positioned content near its trigger when clicked", async () => {
    const screen = await renderPopover();

    await expect.element(screen.getByRole("link", { name: "Item" })).not.toBeInTheDocument();

    await screen.getByTestId("pop").click();

    const link = screen.getByRole("link", { name: "Item" });
    await expect.element(link).toBeVisible();

    const content = link.element().closest('[role="menu"]');
    expect(content).toBeInstanceOf(HTMLElement);

    const contentRect = (content as HTMLElement).getBoundingClientRect();
    const triggerRect = screen.getByTestId("pop").element().getBoundingClientRect();

    expect(contentRect.width).toBeGreaterThan(0);
    expect(contentRect.height).toBeGreaterThan(0);
    expect(contentRect.left).toBeGreaterThanOrEqual(0);
    expect(contentRect.top).toBeGreaterThanOrEqual(0);
    expect(contentRect.right).toBeLessThanOrEqual(window.innerWidth);
    expect(contentRect.bottom).toBeLessThanOrEqual(window.innerHeight);
    expect(Math.abs(contentRect.top - triggerRect.bottom)).toBeLessThanOrEqual(16);
  });

  it("closes its content on Escape", async () => {
    const screen = await renderPopover();

    await screen.getByTestId("pop").click();
    await expect.element(screen.getByRole("link", { name: "Item" })).toBeVisible();

    await userEvent.keyboard("{Escape}");

    await expect.element(screen.getByRole("link", { name: "Item" })).not.toBeInTheDocument();
  });
});
