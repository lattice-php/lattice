import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimePicker } from "./time-picker";
import type { TimeValue } from "./time-picker-columns";

describe("TimePicker", () => {
  it("renders hour and minute columns and no seconds by default", () => {
    render(<TimePicker value={{ hour: 1, minute: 1, second: 0 }} onChange={() => {}} />);

    expect(screen.getByRole("listbox", { name: "Hour" })).toBeInTheDocument();
    expect(screen.getByRole("listbox", { name: "Minute" })).toBeInTheDocument();
    expect(screen.queryByRole("listbox", { name: "Second" })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Hour 01" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("emits a full time value when an option is clicked", () => {
    const onChange = vi.fn<(next: TimeValue) => void>();

    render(<TimePicker value={{ hour: 1, minute: 1, second: 0 }} onChange={onChange} />);

    fireEvent.click(screen.getByRole("option", { name: "Hour 14" }));

    expect(onChange).toHaveBeenCalledWith({ hour: 14, minute: 1, second: 0 });
  });

  it("shows a seconds column for sub-minute steps", () => {
    render(<TimePicker value={{ hour: 0, minute: 0, second: 0 }} step={30} onChange={() => {}} />);

    expect(screen.getByRole("listbox", { name: "Second" })).toBeInTheDocument();
  });

  it("disables out-of-range options from min", () => {
    render(
      <TimePicker value={{ hour: 10, minute: 0, second: 0 }} min="10:00" onChange={() => {}} />,
    );

    expect(screen.getByRole("option", { name: "Hour 09" })).toBeDisabled();
    expect(screen.getByRole("option", { name: "Hour 10" })).not.toBeDisabled();
  });

  it("moves selection with the down arrow", () => {
    const onChange = vi.fn<(next: TimeValue) => void>();

    render(<TimePicker value={{ hour: 1, minute: 0, second: 0 }} onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole("option", { name: "Hour 01" }), { key: "ArrowDown" });

    expect(onChange).toHaveBeenCalledWith({ hour: 2, minute: 0, second: 0 });
  });
});
