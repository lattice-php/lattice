import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { describe, expect, it, vi } from "vitest";
import type { TimeValue } from "./time-picker-columns";
import { TimePicker } from "./time-picker";

describe("TimePicker in a browser", () => {
  it("scrolls the selected option into its column's viewport on open", async () => {
    await page.viewport(1280, 800);

    const screen = await render(
      <TimePicker value={{ hour: 21, minute: 0, second: 0 }} onChange={() => {}} />,
    );
    const option = screen.getByRole("option", { name: "Hour 21" }).element();
    const listbox = option.closest('[role="listbox"]') as HTMLElement;

    expect(listbox.scrollHeight).toBeGreaterThan(listbox.clientHeight);

    const optionRect = option.getBoundingClientRect();
    const listboxRect = listbox.getBoundingClientRect();

    expect(optionRect.top).toBeGreaterThanOrEqual(listboxRect.top - 1);
    expect(optionRect.bottom).toBeLessThanOrEqual(listboxRect.bottom + 1);
  });

  it("traverses columns and selects with real keyboard events", async () => {
    await page.viewport(1280, 800);

    const onChange = vi.fn<(next: TimeValue) => void>();
    const screen = await render(
      <TimePicker value={{ hour: 1, minute: 0, second: 0 }} onChange={onChange} />,
    );
    const hour = screen.getByRole("option", { name: "Hour 01" }).element();

    hour.focus();
    hour.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }));

    expect(document.activeElement?.getAttribute("aria-label")).toBe("Minute 00");

    document.activeElement?.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" }),
    );

    expect(onChange).toHaveBeenLastCalledWith({ hour: 1, minute: 1, second: 0 });
  });
});
