import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Node } from "@lattice/lattice/core/types";

const http = vi.hoisted(() => ({
  processing: false,
  transformer: (data: Record<string, unknown>): Record<string, unknown> => data,
  transform(fn: (data: Record<string, unknown>) => Record<string, unknown>): void {
    this.transformer = fn;
  },
  patch: vi.fn<(url: string) => Promise<{ effects: never[] }>>(async () => ({ effects: [] })),
}));

vi.mock("@inertiajs/react", () => ({
  useHttp: () => http,
  router: { reload: vi.fn<() => void>(), visit: vi.fn<(url: string) => void>() },
}));

const { default: TableComponent } = await import("./table");

const node = {
  id: "workbench.products",
  props: {
    columns: [{ key: "name", label: "Name" }],
    data: [
      { id: 1, name: "Lamp" },
      { id: 2, name: "Shelf" },
    ],
    endpoint: "/lattice/tables/workbench.products",
    bulkActions: [
      {
        type: "action",
        id: "workbench.products.archive-selected",
        props: {
          label: "Archive selected",
          method: "patch",
          endpoint: "/lattice/bulk-actions/workbench.products.archive-selected",
          ref: "sealed-ref",
          variant: "destructive",
        },
      },
    ],
  },
  type: "table",
} satisfies Node<"table">;

describe("table bulk actions", () => {
  afterEach(() => {
    http.patch.mockClear();
  });

  it("dispatches the selected rows when a bulk action runs", async () => {
    render(<TableComponent node={node}>{null}</TableComponent>);

    expect(screen.queryByText("1 selected")).toBeNull();

    fireEvent.click(screen.getByRole("checkbox", { name: "Select row 1" }));

    expect(screen.getByText("1 selected")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Archive selected" }));

    await waitFor(() =>
      expect(http.patch).toHaveBeenCalledWith(
        "/lattice/bulk-actions/workbench.products.archive-selected",
        { headers: { "X-Lattice-Ref": "sealed-ref" } },
      ),
    );
    expect(http.transformer({})).toEqual({ selected: ["1"] });
  });

  it("selects every row from the header checkbox", () => {
    render(<TableComponent node={node}>{null}</TableComponent>);

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));

    expect(screen.getByText("2 selected")).toBeVisible();
  });

  it("dispatches all matching rows with the current filter", async () => {
    const matchingNode = {
      ...node,
      props: {
        ...node.props,
        state: {
          filters: [{ field: "status", operator: "equals", value: "active" }],
          sorts: [],
          page: 1,
          perPage: 25,
        },
        pagination: { total: 50, currentPage: 1, lastPage: 2, mode: "table" },
      },
    } satisfies Node<"table">;

    render(<TableComponent node={matchingNode}>{null}</TableComponent>);

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    fireEvent.click(screen.getByRole("button", { name: "Select all 50 matching" }));

    expect(screen.getByText("All 50 selected")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Archive selected" }));

    await waitFor(() => expect(http.patch).toHaveBeenCalled());
    expect(http.transformer({})).toEqual({
      allMatching: true,
      filter: "status:equals:active",
    });
  });
});
