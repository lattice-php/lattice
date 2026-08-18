import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "./segmented-control";

const options = [
  { label: "Small", value: "s" },
  { label: "Large", value: "l" },
];

describe("SegmentedControl", () => {
  it("owns its selection state and reports changes", () => {
    const onValueChange = vi.fn();

    render(<SegmentedControl name="size" onValueChange={onValueChange} options={options} />);

    expect(screen.getByRole("radio", { name: "Small" })).toHaveAttribute("aria-checked", "true");

    fireEvent.click(screen.getByRole("radio", { name: "Large" }));

    expect(screen.getByRole("radio", { name: "Large" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenCalledWith("l");
  });

  it("supports controlled selection", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <SegmentedControl name="size" onValueChange={onValueChange} options={options} value="s" />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Large" }));

    expect(onValueChange).toHaveBeenCalledWith("l");
    expect(screen.getByRole("radio", { name: "Small" })).toHaveAttribute("aria-checked", "true");

    rerender(
      <SegmentedControl name="size" onValueChange={onValueChange} options={options} value="l" />,
    );

    expect(screen.getByRole("radio", { name: "Large" })).toHaveAttribute("aria-checked", "true");
  });

  it("prevents selection when disabled", () => {
    const onValueChange = vi.fn();
    render(
      <SegmentedControl disabled name="size" onValueChange={onValueChange} options={options} />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Large" }));

    expect(screen.getByRole("radio", { name: "Small" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("focuses the selected option when autoFocus is on", () => {
    render(<SegmentedControl autoFocus name="size" options={options} value="l" />);

    expect(screen.getByRole("radio", { name: "Large" })).toHaveFocus();
  });

  it("focuses the first option when autoFocus is on without a selection", () => {
    render(<SegmentedControl autoFocus name="size" options={options} value="" />);

    expect(screen.getByRole("radio", { name: "Small" })).toHaveFocus();
  });
});
