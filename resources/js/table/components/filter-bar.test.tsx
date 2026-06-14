import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FilterData } from "@lattice-php/lattice/types/generated";
import { FilterBar } from "./filter-bar";

const selectFilter: FilterData = {
  key: "status",
  label: "Status",
  type: "select",
  props: {
    options: [
      { label: "Active", value: "active" },
      { label: "Draft", value: "draft" },
    ],
    multiple: false,
    searchable: false,
    placeholder: null,
  },
};

const toggleFilter: FilterData = {
  key: "high_value",
  label: "High value",
  type: "toggle",
  props: {},
};

function renderBar(props: Partial<Parameters<typeof FilterBar>[0]> = {}) {
  const onChange = vi.fn<(key: string, value: unknown) => void>();
  const onReset = vi.fn<() => void>();

  render(
    <FilterBar
      filters={[selectFilter, toggleFilter]}
      values={{}}
      processing={false}
      hasActiveFilters={false}
      onChange={onChange}
      onReset={onReset}
      {...props}
    />,
  );

  return { onChange, onReset };
}

describe("FilterBar", () => {
  it("emits a value when a select option is chosen", () => {
    const { onChange } = renderBar();

    fireEvent.change(screen.getByRole("combobox", { name: "Status" }), {
      target: { value: "active" },
    });

    expect(onChange).toHaveBeenCalledWith("status", "active");
  });

  it("emits the on state when a toggle is checked", () => {
    const { onChange } = renderBar();

    fireEvent.click(screen.getByRole("checkbox", { name: "High value" }));

    expect(onChange).toHaveBeenCalledWith("high_value", "1");
  });

  it("renders an active-value chip whose remove clears the filter", () => {
    const { onChange } = renderBar({ values: { status: "active" }, hasActiveFilters: true });

    const remove = screen.getByRole("button", { name: "Remove Status filter" });
    expect(remove).toBeInTheDocument();

    fireEvent.click(remove);

    expect(onChange).toHaveBeenCalledWith("status", undefined);
  });

  it("resets all filters", () => {
    const { onReset } = renderBar({ values: { status: "active" }, hasActiveFilters: true });

    fireEvent.click(screen.getByRole("button", { name: "Reset all" }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
