import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FilterNode, TableColumn } from "@lattice-php/table/types";
import { registry } from "@lattice-php/lattice/registry";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import { FilterBar, FilterMenu } from "./filter-bar";

const selectFilter: FilterNode = {
  key: "status",
  type: "filter.select",
  props: {
    label: "Status",
    options: [
      { label: "Active", value: "active", data: null },
      { label: "Draft", value: "draft", data: null },
    ],
    multiple: false,
    searchable: false,
    placeholder: null,
  },
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
};

const toggleFilter: FilterNode = {
  key: "high_value",
  type: "filter.toggle",
  props: { label: "High value" },
};

const nameColumn: TableColumn = {
  key: "name",
  type: "column.text",
  props: {
    label: "Name",
    width: "md",
    align: "start",
    sortable: false,
    toggleable: false,
    hiddenByDefault: false,
    filter: null,
    pinned: null,
    options: [],
  },
};

function renderBar(props: Partial<Parameters<typeof FilterBar>[0]> = {}) {
  const onChange = vi.fn<(key: string, value: unknown) => void>();
  const onRemoveClause = vi.fn<(index: number) => void>();
  const onReset = vi.fn<() => void>();

  renderWithRegistry(
    <FilterBar
      clauses={[]}
      columnsByKey={new Map()}
      indicators={[]}
      processing={false}
      onRemoveClause={onRemoveClause}
      onChange={onChange}
      onReset={onReset}
      {...props}
    />,
    registry,
  );

  return { onChange, onRemoveClause, onReset };
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
    });

    const remove = screen.getByRole("button", { name: "Remove Status filter" });
    expect(remove).toBeInTheDocument();

    fireEvent.click(remove);

    expect(onChange).toHaveBeenCalledWith("status", undefined);
  });

  it("renders a column-filter chip whose remove drops the clause", () => {
    const { onRemoveClause } = renderBar({
      clauses: [{ field: "name", operator: "contains", value: "Ada" }],
      columnsByKey: new Map([["name", nameColumn]]),
    });

    expect(screen.getByText("Ada")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove Name filter" }));

    expect(onRemoveClause).toHaveBeenCalledWith(0);
  });

  it("renders one reset for column and dedicated chips combined", () => {
    renderBar({
      clauses: [{ field: "name", operator: "contains", value: "Ada" }],
      columnsByKey: new Map([["name", nameColumn]]),
      indicators: [{ filter: "status", label: "Status", value: "Active" }],
    });

    expect(screen.getAllByRole("button", { name: "Reset all" })).toHaveLength(1);
  });

  it("resets all filters", () => {
    const { onReset } = renderBar({
      indicators: [{ filter: "status", label: "Status", value: "Active" }],
    });

    fireEvent.click(screen.getByRole("button", { name: "Reset all" }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
