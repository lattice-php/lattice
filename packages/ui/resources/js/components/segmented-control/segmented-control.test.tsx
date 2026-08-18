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

  it("renders nothing when there are no options", () => {
    const { container } = render(<SegmentedControl name="empty" options={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
