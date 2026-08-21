import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { defaultNavigation, NavigationProvider } from "../../navigation";
import { Dropdown } from "./dropdown";

function renderDropdown(onNavigate?: (listener: () => void) => () => void) {
  const menu = (
    <Dropdown data-test="pop" trigger={<span>Open</span>}>
      <a href="/x">Item</a>
    </Dropdown>
  );

  return render(
    onNavigate ? (
      <NavigationProvider adapter={{ ...defaultNavigation, onNavigate }}>{menu}</NavigationProvider>
    ) : (
      menu
    ),
  );
}

describe("Dropdown in a browser", () => {
  it("opens positioned menu content near its trigger when clicked", async () => {
    const screen = await renderDropdown();

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
    const screen = await renderDropdown();

    await screen.getByTestId("pop").click();
    await expect.element(screen.getByRole("link", { name: "Item" })).toBeVisible();

    await userEvent.keyboard("{Escape}");

    await expect.element(screen.getByRole("link", { name: "Item" })).not.toBeInTheDocument();
  });

  it("closes when the navigation adapter reports a navigation", async () => {
    const listeners: Array<() => void> = [];
    const screen = await renderDropdown((listener) => {
      listeners.push(listener);

      return () => undefined;
    });

    await screen.getByTestId("pop").click();
    await expect.element(screen.getByRole("link", { name: "Item" })).toBeVisible();

    act(() => listeners.forEach((listener) => listener()));

    await expect.element(screen.getByRole("link", { name: "Item" })).not.toBeInTheDocument();
  });
});
