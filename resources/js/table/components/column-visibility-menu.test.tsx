import type { ToggleableColumn } from "@lattice-php/lattice/core/use-column-visibility";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColumnVisibilityMenu } from "./column-visibility-menu";

const columns: ToggleableColumn[] = [
  { key: "sku", label: "SKU", toggleable: true },
  { key: "notes", label: "Notes", toggleable: true },
];

function setup(overrides: Partial<Parameters<typeof ColumnVisibilityMenu>[0]> = {}) {
  const onToggle = vi.fn<(key: string, visible: boolean) => void>();
  const onReset = vi.fn<() => void>();
  render(
    <ColumnVisibilityMenu
      columns={columns}
      isVisible={() => true}
      visibleColumnCount={3}
      hasHidden={false}
      onToggle={onToggle}
      onReset={onReset}
      processing={false}
      {...overrides}
    />,
  );
  return { onReset, onToggle };
}

describe("ColumnVisibilityMenu", () => {
  it("toggles a column off", () => {
    const { onToggle } = setup();
    fireEvent.click(screen.getByTestId("table-columns-menu"));
    fireEvent.click(screen.getByTestId("table-column-toggle-sku"));
    expect(onToggle).toHaveBeenCalledWith("sku", false);
  });

  it("disables hiding the last visible column", () => {
    setup({ visibleColumnCount: 1, isVisible: (c) => c.key === "sku" });
    fireEvent.click(screen.getByTestId("table-columns-menu"));
    expect(screen.getByTestId("table-column-toggle-sku")).toBeDisabled();
  });
});
