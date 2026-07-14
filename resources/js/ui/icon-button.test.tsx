import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "./icon-button";

describe("IconButton", () => {
  it("renders an accessible icon button and forwards clicks", () => {
    const onClick = vi.fn();
    render(<IconButton icon="x" label="Clear" onClick={onClick} />);

    const button = screen.getByRole("button", { name: "Clear" });
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledOnce();
    expect(button).toHaveAttribute("type", "button");
  });

  it("defaults to the sm ghost variant and resizes via size", () => {
    const { rerender } = render(<IconButton icon="x" label="A" />);
    expect(screen.getByRole("button", { name: "A" })).toHaveClass("size-7");

    rerender(<IconButton icon="x" label="A" size="xs" />);
    expect(screen.getByRole("button", { name: "A" })).toHaveClass("size-5");

    rerender(<IconButton icon="x" label="A" size="md" />);
    expect(screen.getByRole("button", { name: "A" })).toHaveClass("size-lt-control-md");
  });

  it("reflects toggle state through aria-pressed", () => {
    const { rerender } = render(<IconButton icon="star" label="Bold" active={false} />);
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "false");

    rerender(<IconButton icon="star" label="Bold" active />);
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
  });

  it("omits aria-pressed for non-toggle buttons and renders overlay children", () => {
    render(
      <IconButton icon="filter" label="Filters">
        <span>2</span>
      </IconButton>,
    );

    const button = screen.getByRole("button", { name: "Filters" });
    expect(button).not.toHaveAttribute("aria-pressed");
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
