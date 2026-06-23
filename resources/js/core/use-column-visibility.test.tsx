import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { type ToggleableColumn, useColumnVisibility } from "./use-column-visibility";

const columns: ToggleableColumn[] = [
  { key: "name", label: "Name" },
  { key: "sku", label: "SKU", toggleable: true },
  { key: "notes", label: "Notes", toggleable: true, hiddenByDefault: true },
];

function Harness({ storageKey }: { storageKey?: string }) {
  const { visibleColumns, hasToggleableColumns, hasHidden, setColumnVisible, resetVisibility } =
    useColumnVisibility({ columns, storageKey });

  return (
    <div>
      <span data-test="visible">{visibleColumns.map((c) => c.key).join(",")}</span>
      <span data-test="has-toggleable">{String(hasToggleableColumns)}</span>
      <span data-test="has-hidden">{String(hasHidden)}</span>
      <button data-test="hide-sku" onClick={() => setColumnVisible("sku", false)} type="button">
        hide sku
      </button>
      <button data-test="show-notes" onClick={() => setColumnVisible("notes", true)} type="button">
        show notes
      </button>
      <button data-test="reset" onClick={resetVisibility} type="button">
        reset
      </button>
    </div>
  );
}

describe("useColumnVisibility", () => {
  beforeEach(() => window.localStorage.clear());

  it("shows non-toggleable and default-visible columns, hides hidden-by-default", () => {
    render(<Harness />);
    expect(screen.getByTestId("visible")).toHaveTextContent("name,sku");
    expect(screen.getByTestId("has-toggleable")).toHaveTextContent("true");
    expect(screen.getByTestId("has-hidden")).toHaveTextContent("true");
  });

  it("hides a column on toggle and persists it", () => {
    render(<Harness storageKey="vis" />);
    fireEvent.click(screen.getByTestId("hide-sku"));
    expect(screen.getByTestId("visible")).toHaveTextContent("name");
    expect(JSON.parse(window.localStorage.getItem("vis") ?? "")).toEqual({
      columns: ["sku", "notes"],
      overrides: { sku: false },
    });
  });

  it("reveals a hidden-by-default column on toggle", () => {
    render(<Harness />);
    fireEvent.click(screen.getByTestId("show-notes"));
    expect(screen.getByTestId("visible")).toHaveTextContent("name,sku,notes");
  });

  it("restores defaults on reset", () => {
    render(<Harness storageKey="vis" />);
    fireEvent.click(screen.getByTestId("hide-sku"));
    fireEvent.click(screen.getByTestId("reset"));
    expect(screen.getByTestId("visible")).toHaveTextContent("name,sku");
    expect(window.localStorage.getItem("vis")).toBeNull();
  });

  it("loads persisted overrides and ignores unknown keys", () => {
    window.localStorage.setItem(
      "vis",
      JSON.stringify({ columns: ["sku"], overrides: { sku: false, ghost: true } }),
    );
    render(<Harness storageKey="vis" />);
    expect(screen.getByTestId("visible")).toHaveTextContent("name");
  });

  it("discards malformed stored data", () => {
    window.localStorage.setItem("vis", "not-json");
    render(<Harness storageKey="vis" />);
    expect(screen.getByTestId("visible")).toHaveTextContent("name,sku");
    expect(window.localStorage.getItem("vis")).toBeNull();
  });
});
