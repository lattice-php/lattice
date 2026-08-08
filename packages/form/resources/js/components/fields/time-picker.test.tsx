import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimePicker } from "./time-picker";
import type { TimeValue } from "./time-picker-columns";

describe("TimePicker", () => {
  it("emits a full time value when an option is clicked", () => {
    const onChange = vi.fn<(next: TimeValue) => void>();

    render(<TimePicker value={{ hour: 1, minute: 1, second: 0 }} onChange={onChange} />);

    fireEvent.click(screen.getByRole("option", { name: "Hour 14" }));

    expect(onChange).toHaveBeenCalledWith({ hour: 14, minute: 1, second: 0 });
  });

  it("disables out-of-range options from min", () => {
    render(
      <TimePicker value={{ hour: 10, minute: 0, second: 0 }} min="10:00" onChange={() => {}} />,
    );

    expect(screen.getByRole("option", { name: "Hour 09" })).toBeDisabled();
    expect(screen.getByRole("option", { name: "Hour 10" })).not.toBeDisabled();
  });

  it.each([
    { key: "ArrowDown", start: "Hour 01", hour: 1, expected: 2 },
    { key: "ArrowUp", start: "Hour 02", hour: 2, expected: 1 },
    { key: "End", start: "Hour 05", hour: 5, expected: 23 },
    { key: "Home", start: "Hour 05", hour: 5, expected: 0 },
  ])("moves the hour selection with $key", ({ key, start, hour, expected }) => {
    const onChange = vi.fn<(next: TimeValue) => void>();

    render(<TimePicker value={{ hour, minute: 0, second: 0 }} onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole("option", { name: start }), { key });

    expect(onChange).toHaveBeenCalledWith({ hour: expected, minute: 0, second: 0 });
  });

  it("selects a value in the seconds column", () => {
    const onChange = vi.fn<(next: TimeValue) => void>();

    render(<TimePicker value={{ hour: 0, minute: 0, second: 0 }} step={30} onChange={onChange} />);

    fireEvent.click(screen.getByRole("option", { name: "Second 05" }));

    expect(onChange).toHaveBeenCalledWith({ hour: 0, minute: 0, second: 5 });
  });

  it("ignores interaction when disabled", () => {
    const onChange = vi.fn<(next: TimeValue) => void>();

    render(<TimePicker value={{ hour: 1, minute: 0, second: 0 }} disabled onChange={onChange} />);

    const hour = screen.getByRole("option", { name: "Hour 01" });

    expect(hour).toBeDisabled();

    fireEvent.keyDown(hour, { key: "ArrowDown" });

    expect(onChange).not.toHaveBeenCalled();
  });
});
