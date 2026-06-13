import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SizableColumn } from "./column-sizing";
import { useColumnResizing } from "./use-column-resizing";

const columns: SizableColumn[] = [
  {
    key: "qty",
    label: "Qty",
    width: "sm",
  },
];

const twoColumns: SizableColumn[] = [
  {
    key: "qty",
    label: "Qty",
    width: "sm",
  },
  {
    key: "price",
    label: "Price",
    width: "md",
  },
];

function rect(width: number): DOMRect {
  return {
    bottom: 0,
    height: 0,
    left: 0,
    right: width,
    top: 0,
    width,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  };
}

function Harness({
  columnGapPx = 0,
  hookColumns = columns,
  leadingTracks = [],
  showIndicator = false,
  trailingTracks = [],
}: {
  columnGapPx?: number;
  hookColumns?: SizableColumn[];
  leadingTracks?: string[];
  showIndicator?: boolean;
  trailingTracks?: string[];
}) {
  const { gridTemplateColumns, getResizeHandleProps } = useColumnResizing({
    enabled: true,
    columns: hookColumns,
    columnGapPx,
    leadingTracks,
    showIndicator,
    trailingTracks,
  });

  return (
    <div data-testid="grid" style={{ gridTemplateColumns }}>
      {hookColumns.map((column) => (
        <div key={column.key} data-testid={`cell-${column.key}`}>
          <div {...getResizeHandleProps(column)} />
        </div>
      ))}
    </div>
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

  it("caps a dragged column to the available grid width", () => {
    render(
      <Harness
        hookColumns={twoColumns}
        leadingTracks={["3rem"]}
        trailingTracks={["3rem"]}
        columnGapPx={12}
      />,
    );

    const grid = screen.getByTestId("grid");
    const handle = screen.getByRole("separator", { name: "Resize Qty" });
    const cell = screen.getByTestId("cell-qty");

    vi.spyOn(grid, "getBoundingClientRect").mockReturnValue(rect(420));
    vi.spyOn(cell, "getBoundingClientRect").mockReturnValue(rect(128));

    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 800, pointerId: 1 });

    expect(grid).toHaveStyle({
      gridTemplateColumns: "3rem 160px minmax(8rem, 1fr) 3rem",
    });
  });

  it("can render a visible resize indicator", () => {
    render(<Harness showIndicator={true} />);

    expect(screen.getByRole("separator", { name: "Resize Qty" }).className.split(" ")).toContain(
      "after:bg-lt-border",
    );
  });
});
