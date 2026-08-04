import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("reflects the checked state and emits changes", () => {
    const onCheckedChange = vi.fn<(checked: boolean | "indeterminate") => void>();
    render(<Checkbox aria-label="Accept" checked={false} onCheckedChange={onCheckedChange} />);

    const checkbox = screen.getByRole("checkbox", { name: "Accept" });
    expect(checkbox).toHaveAttribute("data-state", "unchecked");

    fireEvent.click(checkbox);

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("renders the indicator when checked", () => {
    render(<Checkbox aria-label="Accept" checked />);

    expect(screen.getByRole("checkbox", { name: "Accept" })).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  it("merges a custom class and supports the disabled state", () => {
    render(<Checkbox aria-label="Accept" className="custom-class" disabled checked />);

    const checkbox = screen.getByRole("checkbox", { name: "Accept" });
    expect(checkbox).toHaveClass("custom-class");
    expect(checkbox).toBeDisabled();
  });
});
