import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
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

function Harness({
  enabled = true,
  hookColumns = columns,
  showIndicator = false,
  storageKey,
}: {
  enabled?: boolean;
  hookColumns?: SizableColumn[];
  showIndicator?: boolean;
  storageKey?: string;
}) {
  const { gridTemplateColumns, getResizeHandleProps, hasOverrides, resizeRootRef, resetColumns } =
    useColumnResizing({
      enabled,
      columns: hookColumns,
      columnGapPx: 0,
      showIndicator,
      storageKey,
    });

  return (
    <div ref={resizeRootRef} data-test="grid" style={{ gridTemplateColumns }}>
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
    expect(screen.getByTestId("has-overrides")).toHaveTextContent("false");
    expect(window.localStorage.getItem("cols")).toBeNull();

    fireEvent.pointerUp(handle, { clientX: 180, pointerId: 1 });

    expect(screen.getByTestId("has-overrides")).toHaveTextContent("true");
    expect(window.localStorage.getItem("cols")).not.toBeNull();

    fireEvent.click(screen.getByTestId("reset"));

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "minmax(6rem, 0.5fr)" });
    expect(screen.getByTestId("has-overrides")).toHaveTextContent("false");
    expect(window.localStorage.getItem("cols")).toBeNull();
  });

  it("resizes with keyboard arrows and resets with enter", () => {
    render(<Harness />);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "136px" });

    fireEvent.keyDown(handle, { key: "Enter" });
    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "minmax(6rem, 0.5fr)" });
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

  it("stores resized widths once a drag commits", () => {
    render(<Harness hookColumns={twoColumns} storageKey="lattice:table-columns:orders" />);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 180, pointerId: 1 });

    expect(window.localStorage.getItem("lattice:table-columns:orders")).toBeNull();

    fireEvent.pointerUp(handle, { clientX: 180, pointerId: 1 });

    expect(JSON.parse(window.localStorage.getItem("lattice:table-columns:orders") ?? "")).toEqual({
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

  it.each([
    ["minimum", "Home", "96px"],
    ["maximum", "End", "1024px"],
  ])("clamps to the %s width with %s", (_limit, key, expected) => {
    render(<Harness />);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    fireEvent.keyDown(handle, { key });

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: expected });
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

  it("commits pending widths when a pointer drag is cancelled", () => {
    render(<Harness storageKey="cols" />);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 180, pointerId: 1 });
    fireEvent.pointerCancel(handle, { clientX: 180, pointerId: 1 });

    expect(screen.getByTestId("grid")).toHaveStyle({ gridTemplateColumns: "208px" });
    expect(screen.getByTestId("has-overrides")).toHaveTextContent("true");
    expect(JSON.parse(window.localStorage.getItem("cols") ?? "")).toEqual({
      overrides: {
        qty: 208,
      },
    });
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
