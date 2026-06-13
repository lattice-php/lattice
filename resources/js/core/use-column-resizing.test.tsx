import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SizableColumn } from "./column-sizing";
import { useColumnResizing } from "./use-column-resizing";

const columns: SizableColumn[] = [
  {
    key: "qty",
    label: "Qty",
    width: "sm",
  },
];

function Harness() {
  const { gridTemplateColumns, getResizeHandleProps } = useColumnResizing({
    enabled: true,
    columns,
  });

  return (
    <>
      <div data-testid="grid" style={{ gridTemplateColumns }} />
      <div {...getResizeHandleProps(columns[0])} />
    </>
  );
}

describe("useColumnResizing", () => {
  it("updates the grid template while dragging a handle", () => {
    render(<Harness />);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 180, pointerId: 1 });

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "208px" });
  });

  it("resizes with keyboard arrows and resets with enter", () => {
    render(<Harness />);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "136px" });

    fireEvent.keyDown(handle, { key: "Enter" });
    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "minmax(6rem, 0.5fr)" });
  });

  it("describes and clamps the resize maximum", () => {
    render(<Harness />);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    expect(handle).toHaveAttribute("aria-valuemax", "1024");

    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 2000, pointerId: 1 });

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "1024px" });
  });
});
