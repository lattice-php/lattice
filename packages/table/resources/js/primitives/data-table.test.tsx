import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableGrid,
  DataTableHeader,
  DataTableHeaderCell,
  DataTableHeaderRow,
  DataTablePagination,
  DataTableRow,
  DataTableRowToggle,
  DataTableSearch,
  DataTableSortButton,
  dataTableUtilityTracks,
} from "./data-table";

describe("DataTable primitives", () => {
  it("exposes sort state on the header cell and forwards sort clicks", () => {
    const onSort = vi.fn();
    const { rerender } = render(
      <DataTableHeaderRow>
        <DataTableHeaderCell sortDirection="asc">
          <DataTableSortButton direction="asc" onClick={onSort}>
            Name
          </DataTableSortButton>
        </DataTableHeaderCell>
      </DataTableHeaderRow>,
    );

    expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "ascending");

    fireEvent.click(screen.getByRole("button", { name: "Name" }));
    expect(onSort).toHaveBeenCalledTimes(1);

    rerender(
      <DataTableHeaderRow>
        <DataTableHeaderCell sortDirection={null}>
          <DataTableSortButton onClick={onSort}>Name</DataTableSortButton>
        </DataTableHeaderCell>
      </DataTableHeaderRow>,
    );

    expect(screen.getByRole("columnheader")).not.toHaveAttribute("aria-sort");
  });

  it("marks pinned tracks with their side, boundary, and offset variable", () => {
    render(
      <DataTable>
        <DataTableGrid columns="3rem 160px minmax(0, 1fr) 10rem" pinned>
          <DataTableHeader>
            <DataTableHeaderRow>
              <DataTableHeaderCell kind="selection" pinned="left" />
              <DataTableHeaderCell pinned="left" pinIndex={0} pinBoundary="end">
                Name
              </DataTableHeaderCell>
              <DataTableHeaderCell kind="filler" />
              <DataTableHeaderCell kind="actions" pinned="right" pinBoundary="start">
                Actions
              </DataTableHeaderCell>
            </DataTableHeaderRow>
          </DataTableHeader>
          <DataTableBody>
            <DataTableRow>
              <DataTableCell kind="selection" pinned="left" />
              <DataTableCell pinned="left" pinIndex={0} pinBoundary="end" label="Name">
                Lamp
              </DataTableCell>
              <DataTableCell kind="filler" />
              <DataTableCell kind="actions" pinned="right" pinBoundary="start" />
            </DataTableRow>
          </DataTableBody>
        </DataTableGrid>
      </DataTable>,
    );

    const table = screen.getByRole("table");
    const headers = screen.getAllByRole("columnheader");
    const cells = screen.getAllByRole("cell");

    expect(table.style.getPropertyValue("--lattice-table-columns")).toBe(
      "3rem 160px minmax(0, 1fr) 10rem",
    );
    expect(headers).toHaveLength(3);
    expect(headers[0]).toHaveAttribute("data-pinned", "left");
    expect(headers[0]).toHaveStyle({ insetInlineStart: "var(--lt-pin-offset-selection)" });
    expect(headers[1]).toHaveAttribute("data-pin-boundary", "end");
    expect(headers[1]).toHaveStyle({ insetInlineStart: "var(--lt-pin-offset-0)" });
    expect(headers[2]).toHaveAttribute("data-pinned", "right");
    expect(headers[2]).toHaveStyle({ insetInlineEnd: "var(--lt-pin-offset-actions)" });
    expect(cells).toHaveLength(3);
    expect(cells[1]).toHaveAttribute("data-pin-boundary", "end");
    expect(cells[2]).toHaveStyle({ insetInlineEnd: "var(--lt-pin-offset-actions)" });
  });

  it("toggles the expander's aria-expanded state", () => {
    const { rerender } = render(<DataTableRowToggle expanded={false} aria-label="Toggle" />);

    expect(screen.getByRole("button", { name: "Toggle" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    rerender(<DataTableRowToggle expanded aria-label="Toggle" />);

    expect(screen.getByRole("button", { name: "Toggle" })).toHaveAttribute("aria-expanded", "true");
  });

  it("offers a clear button only while the search has a value", () => {
    const onClear = vi.fn();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <DataTableSearch
        clearLabel="Clear"
        onClear={onClear}
        onValueChange={onValueChange}
        placeholder="Search"
        value=""
      />,
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Search" }), {
      target: { value: "lamp" },
    });
    expect(onValueChange).toHaveBeenCalledWith("lamp");
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();

    rerender(
      <DataTableSearch
        clearLabel="Clear"
        onClear={onClear}
        onValueChange={onValueChange}
        placeholder="Search"
        value="lamp"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("disables the edge buttons and the current page while paging", () => {
    const onPageChange = vi.fn();
    const labels = { next: "Next", page: (page: number) => `Page ${page}`, previous: "Previous" };
    const { rerender } = render(
      <DataTablePagination
        hasNextPage
        labels={labels}
        onPageChange={onPageChange}
        page={1}
        pages={[1, 2, 3]}
      />,
    );

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Page 1" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange).toHaveBeenNthCalledWith(1, 3);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 2);

    rerender(
      <DataTablePagination
        hasNextPage={false}
        labels={labels}
        onPageChange={onPageChange}
        page={3}
      />,
    );

    expect(screen.queryByRole("button", { name: "Page 3" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
  });

  it("derives the fixed utility tracks in expander, selection, actions order", () => {
    expect(dataTableUtilityTracks({ actions: true, expander: true, selection: true })).toEqual({
      leadingTracks: ["2.5rem", "3rem"],
      trailingTracks: ["10rem"],
    });
    expect(dataTableUtilityTracks({})).toEqual({ leadingTracks: [], trailingTracks: [] });
  });
});
