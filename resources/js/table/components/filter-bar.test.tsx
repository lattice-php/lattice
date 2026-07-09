import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FilterData } from "@lattice-php/lattice/types/generated";
import { registry } from "@lattice-php/lattice/registry";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import { FilterBar, FilterMenu } from "./filter-bar";

const selectFilter: FilterData = {
  key: "status",
  label: "Status",
  type: "filter.select",
  schema: [
    {
      type: "field.select",
      props: {
        name: "value",
        label: "Status",
        options: [
          { label: "Active", value: "active" },
          { label: "Draft", value: "draft" },
        ],
        multiple: false,
        searchable: false,
        placeholder: null,
      },
    },
  ],
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
  type: "filter.toggle",
  schema: [],
  props: {},
};

function renderBar(props: Partial<Parameters<typeof FilterBar>[0]> = {}) {
  const onChange = vi.fn<(key: string, value: unknown) => void>();
  const onReset = vi.fn<() => void>();

  renderWithRegistry(
    <FilterBar
      indicators={[]}
      processing={false}
      hasActiveFilters={false}
      onChange={onChange}
      onReset={onReset}
      {...props}
    />,
    registry,
  );

  return { onChange, onReset };
}

function renderMenu(props: Partial<Parameters<typeof FilterMenu>[0]> = {}) {
  const onChange = vi.fn<(key: string, value: unknown) => void>();

  renderWithRegistry(
    <FilterMenu
      filters={[selectFilter, toggleFilter]}
      values={{}}
      processing={false}
      onChange={onChange}
      {...props}
    />,
    registry,
  );

  return { onChange };
}

describe("FilterBar", () => {
  it("emits a value when a select option is chosen", () => {
    const { onChange } = renderMenu();

    expect(screen.queryByRole("combobox", { name: "Status" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Filters" }));
    fireEvent.click(screen.getByRole("button", { name: "Status" }));
    fireEvent.click(screen.getByRole("option", { name: "Active" }));

    expect(onChange).toHaveBeenCalledWith("status", { value: "active" });
  });

  it("emits the on state when a toggle is checked", () => {
    const { onChange } = renderMenu();

    fireEvent.click(screen.getByRole("button", { name: "Filters" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "High value" }));

    expect(onChange).toHaveBeenCalledWith("high_value", { value: "1" });
  });

  it("renders an active-value chip whose remove clears the filter", () => {
    const { onChange } = renderBar({
      indicators: [{ filter: "status", label: "Status", value: "Active" }],
      hasActiveFilters: true,
    });

    const remove = screen.getByRole("button", { name: "Remove Status filter" });
    expect(remove).toBeInTheDocument();

    fireEvent.click(remove);

    expect(onChange).toHaveBeenCalledWith("status", undefined);
  });

  it("resets all filters", () => {
    const { onReset } = renderBar({
      indicators: [{ filter: "status", label: "Status", value: "Active" }],
      hasActiveFilters: true,
    });

    fireEvent.click(screen.getByRole("button", { name: "Reset all" }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
