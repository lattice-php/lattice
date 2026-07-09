import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SizableColumn } from "./column-sizing";
import { useColumnResizing } from "./use-column-resizing";

type ResizeGetter = ReturnType<typeof useColumnResizing>["getResizeHandleProps"];

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
  enabled = true,
  hookColumns = columns,
  leadingTracks,
  onGetter,
  showIndicator = false,
  storageKey,
  trailingTracks,
}: {
  columnGapPx?: number;
  enabled?: boolean;
  hookColumns?: SizableColumn[];
  leadingTracks?: string[];
  onGetter?: (getter: ResizeGetter) => void;
  showIndicator?: boolean;
  storageKey?: string;
  trailingTracks?: string[];
}) {
  const { gridTemplateColumns, getResizeHandleProps, hasOverrides, resetColumns } =
    useColumnResizing({
      enabled,
      columns: hookColumns,
      columnGapPx,
      leadingTracks,
      showIndicator,
      storageKey,
      trailingTracks,
    });

  onGetter?.(getResizeHandleProps);

  return (
    <div data-test="grid" style={{ gridTemplateColumns }}>
      <span data-test="has-overrides">{String(hasOverrides)}</span>
      <button data-test="reset" onClick={resetColumns} type="button">
        reset
      </button>
      {hookColumns.map((column) => (
        <div key={column.key} data-test={`cell-${column.key}`}>
          <div {...getResizeHandleProps(column)} />
        </div>
      ))}
    </div>
  );
}

describe("useColumnResizing", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("exposes hasOverrides and resets every column width", () => {
    render(<Harness storageKey="cols" />);

    expect(screen.getByTestId("has-overrides")).toHaveTextContent("false");

    const handle = screen.getByRole("separator", { name: "Resize Qty" });
    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 180, pointerId: 1 });

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "208px" });
    expect(screen.getByTestId("has-overrides")).toHaveTextContent("true");
    expect(window.localStorage.getItem("cols")).not.toBeNull();

    fireEvent.click(screen.getByTestId("reset"));

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "minmax(6rem, 0.5fr)" });
    expect(screen.getByTestId("has-overrides")).toHaveTextContent("false");
    expect(window.localStorage.getItem("cols")).toBeNull();
  });

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

  it("loads stored widths when the column keys match", () => {
    window.localStorage.setItem(
      "lattice:table-columns:orders",
      JSON.stringify({
        columns: ["qty", "price"],
        overrides: {
          qty: 192,
          price: 256,
        },
      }),
    );

    render(<Harness hookColumns={twoColumns} storageKey="lattice:table-columns:orders" />);

    expect(screen.getByTestId("grid")).toHaveStyle({
      gridTemplateColumns: "192px 256px",
    });
  });

  it("keeps stored widths for columns that still exist", () => {
    window.localStorage.setItem(
      "lattice:table-columns:orders",
      JSON.stringify({
        columns: ["qty"],
        overrides: {
          qty: 192,
        },
      }),
    );

    render(<Harness hookColumns={twoColumns} storageKey="lattice:table-columns:orders" />);

    expect(screen.getByTestId("grid")).toHaveStyle({
      gridTemplateColumns: "192px minmax(8rem, 1fr)",
    });
  });

  it("drops stored widths for columns that no longer exist", () => {
    window.localStorage.setItem(
      "lattice:table-columns:orders",
      JSON.stringify({
        columns: ["qty", "removed"],
        overrides: {
          qty: 192,
          removed: 300,
        },
      }),
    );

    render(<Harness storageKey="lattice:table-columns:orders" />);

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "192px" });
  });

  it("stores resized widths with the complete column key list", () => {
    render(<Harness hookColumns={twoColumns} storageKey="lattice:table-columns:orders" />);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 180, pointerId: 1 });

    expect(JSON.parse(window.localStorage.getItem("lattice:table-columns:orders") ?? "")).toEqual({
      columns: ["qty", "price"],
      overrides: {
        qty: 208,
      },
    });
  });

  it("removes stored widths when the last override resets", () => {
    render(<Harness hookColumns={twoColumns} storageKey="lattice:table-columns:orders" />);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 180, pointerId: 1 });
    fireEvent.doubleClick(handle);

    expect(window.localStorage.getItem("lattice:table-columns:orders")).toBeNull();
  });

  it("keeps the handle prop getter stable while dragging", () => {
    const getters: ResizeGetter[] = [];

    render(<Harness onGetter={(getter) => getters.push(getter)} />);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 180, pointerId: 1 });

    expect(getters.length).toBeGreaterThan(1);
    expect(new Set(getters).size).toBe(1);
  });

  it("ignores all interactions while disabled", () => {
    render(<Harness enabled={false} />);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    fireEvent.keyDown(handle, { key: "ArrowRight" });
    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 400, pointerId: 1 });

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "minmax(6rem, 0.5fr)" });
  });

  it("does not render overrides into the grid while disabled", () => {
    window.localStorage.setItem(
      "lattice:table-columns:orders",
      JSON.stringify({ columns: ["qty"], overrides: { qty: 200 } }),
    );

    render(<Harness enabled={false} storageKey="lattice:table-columns:orders" />);

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "minmax(6rem, 0.5fr)" });
  });

  it("takes a larger keyboard step while holding shift", () => {
    render(<Harness />);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    fireEvent.keyDown(handle, { key: "ArrowRight", shiftKey: true });

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "160px" });
  });

  it("shrinks the column with ArrowLeft", () => {
    render(<Harness />);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    fireEvent.keyDown(handle, { key: "ArrowRight" });
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    fireEvent.keyDown(handle, { key: "ArrowLeft" });

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "136px" });
  });

  it("clamps to the minimum width with Home", () => {
    render(<Harness />);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    fireEvent.keyDown(handle, { key: "Home" });

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "96px" });
  });

  it("clamps to the maximum width with End", () => {
    render(<Harness />);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    fireEvent.keyDown(handle, { key: "End" });

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "1024px" });
  });

  it("resets with Escape", () => {
    render(<Harness />);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    fireEvent.keyDown(handle, { key: "ArrowRight" });
    fireEvent.keyDown(handle, { key: "Escape" });

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "minmax(6rem, 0.5fr)" });
  });

  it("clears the drag on pointer up and ignores later moves", () => {
    render(<Harness />);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 180, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientX: 180, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 400, pointerId: 1 });

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "208px" });
  });

  it("ignores a pointer up for a column that is not actively dragging", () => {
    render(<Harness hookColumns={twoColumns} />);

    const qtyHandle = screen.getByRole("separator", { name: "Resize Qty" });
    const priceHandle = screen.getByRole("separator", { name: "Resize Price" });

    fireEvent.pointerDown(qtyHandle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerUp(priceHandle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(qtyHandle, { clientX: 180, pointerId: 1 });

    expect(screen.getByTestId("grid")).toHaveStyle({
      gridTemplateColumns: "208px minmax(8rem, 1fr)",
    });
  });

  it("falls back to the current width when the handle has no measured parent", () => {
    render(<Harness />);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });
    const cell = screen.getByTestId("cell-qty");

    vi.spyOn(cell, "getBoundingClientRect").mockReturnValue(rect(0));

    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 140, pointerId: 1 });

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "168px" });
  });

  it("labels the handle with the column key when no label is set", () => {
    const unlabeled: SizableColumn[] = [{ key: "sku", width: "sm" }];

    render(<Harness hookColumns={unlabeled} />);

    expect(screen.getByRole("separator", { name: "Resize sku" })).toBeInTheDocument();
  });

  it("ignores stored overrides that are not finite numbers", () => {
    window.localStorage.setItem(
      "lattice:table-columns:orders",
      JSON.stringify({ columns: ["qty"], overrides: { qty: "wide" } }),
    );

    render(<Harness storageKey="lattice:table-columns:orders" />);

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "minmax(6rem, 0.5fr)" });
    expect(window.localStorage.getItem("lattice:table-columns:orders")).toBeNull();
  });

  it("discards stored data that is not a column-width record", () => {
    window.localStorage.setItem("lattice:table-columns:orders", "42");

    render(<Harness storageKey="lattice:table-columns:orders" />);

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "minmax(6rem, 0.5fr)" });
    expect(window.localStorage.getItem("lattice:table-columns:orders")).toBeNull();
  });
});
