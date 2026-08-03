import { render } from "vitest-browser-react";
import { beforeEach, describe, expect, it } from "vitest";
import type { SizableColumn } from "./column-sizing";
import { useColumnResizing } from "./use-column-resizing";

const columns: SizableColumn[] = [
  { key: "qty", label: "Qty", width: "sm" },
  { key: "price", label: "Price", width: "md" },
];

function Harness() {
  const { gridTemplateColumns, getResizeHandleProps, resizeRootRef } = useColumnResizing({
    enabled: true,
    columns,
    columnGapPx: 12,
    leadingTracks: ["3rem"],
    trailingTracks: ["3rem"],
  });

  return (
    <div
      ref={resizeRootRef}
      data-test="grid"
      style={{
        columnGap: "12px",
        display: "grid",
        gridTemplateColumns,
        width: "420px",
      }}
    >
      <div style={{ width: "48px" }} />
      {columns.map((column) => (
        <div key={column.key} data-test={`cell-${column.key}`} style={{ minWidth: 0 }}>
          <div {...getResizeHandleProps(column)} />
        </div>
      ))}
      <div style={{ width: "48px" }} />
    </div>
  );
}

describe("useColumnResizing in a browser", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("caps a dragged column to the rendered grid width without mocked geometry", async () => {
    const screen = await render(<Harness />);
    const handle = screen.getByRole("separator", { name: "Resize Qty" }).element();

    handle.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, clientX: 100, pointerId: 1 }),
    );
    handle.dispatchEvent(
      new PointerEvent("pointermove", { bubbles: true, clientX: 800, pointerId: 1 }),
    );

    const grid = screen.getByTestId("grid").element();

    await expect
      .poll(() => (grid as HTMLElement).style.gridTemplateColumns)
      .toBe("3rem 160px minmax(8rem, 1fr) 3rem");
  });
});
