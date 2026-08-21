import { page, userEvent } from "vitest/browser";
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
    const hour = screen.getByRole("option", { name: "Hour 01" });

    await hour.click();
    await userEvent.keyboard("{ArrowRight}");

    await expect.element(screen.getByRole("option", { name: "Minute 00" })).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");

    await expect.poll(() => onChange.mock.lastCall).toEqual([{ hour: 1, minute: 1, second: 0 }]);
  });
});
