import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TableColumn, TableNode } from "@lattice-php/lattice/table/types";
import { fakeNode } from "@lattice-php/lattice/test-support";

function col(partial: { key: string; label: string }): TableColumn {
  return {
    key: partial.key,
    type: "column.text",
    props: {
      label: partial.label,
      width: "md",
      align: "start",
      sortable: false,
      toggleable: false,
      hiddenByDefault: false,
      filter: null,
    },
  };
}

const apiFetch = vi.hoisted(() =>
  vi.fn<(url: string, init?: Record<string, unknown>) => Promise<Response>>(
    async () => new Response(JSON.stringify({ effects: [] }), { status: 200 }),
  ),
);

vi.mock("@lattice-php/lattice/core/api", () => ({ apiFetch }));

vi.mock("@inertiajs/react", async () =>
  (await import("@lattice-php/lattice/test/inertia-mock")).inertiaMock(),
);

const { default: TableComponent } = await import("./table");

const node = {
  id: "workbench.products",
  props: {
    columns: [col({ key: "name", label: "Name" })],
    data: [
      { id: 1, name: "Lamp" },
      { id: 2, name: "Shelf" },
    ],
    endpoint: "/lattice/tables/workbench.products",
    bulkActions: [
      fakeNode({
        type: "action",
        id: "workbench.products.archive-selected",
        props: {
          label: "Archive selected",
          method: "patch",
          endpoint: "/lattice/bulk-actions/workbench.products.archive-selected",
          ref: "sealed-ref",
          variant: "danger",
        },
      }),
    ],
  },
  type: "table",
} satisfies TableNode;

describe("table bulk actions", () => {
  afterEach(() => {
    apiFetch.mockClear();
  });

  it("dispatches the selected rows when a bulk action runs", async () => {
    render(<TableComponent node={node}>{null}</TableComponent>);

    expect(screen.queryByText("1 selected")).toBeNull();

    fireEvent.click(screen.getByRole("checkbox", { name: "Select row 1" }));

    expect(screen.getByText("1 selected")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Archive selected" }));

    await waitFor(() =>
      expect(apiFetch).toHaveBeenCalledWith(
        "/lattice/bulk-actions/workbench.products.archive-selected",
        expect.objectContaining({ method: "patch", ref: "sealed-ref" }),
      ),
    );
    const [, options] = apiFetch.mock.calls[0] as [string, { body: string }];
    expect(JSON.parse(options.body)).toEqual({ selected: ["1"] });
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
        query: {
          filters: [{ field: "status", operator: "eq", value: "active" }],
          sorts: [],
          tableFilters: {
            featured: { value: "true" },
            updated_at: { from: "2026-01-01", until: "" },
          },
          tableFilterIndicators: [
            { filter: "featured", label: "Featured", value: "Yes" },
            { filter: "updated_at", label: "Updated", value: "2026-01-01" },
          ],
          page: 1,
          perPage: 25,
        },
        pagination: {
          mode: "table",
          currentPage: 1,
          lastPage: 2,
          perPage: 25,
          total: 50,
          from: 1,
          to: 50,
          hasMore: false,
          nextPage: null,
        },
      },
    } satisfies TableNode;

    render(<TableComponent node={matchingNode}>{null}</TableComponent>);

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    fireEvent.click(screen.getByRole("button", { name: "Select all 50 matching" }));

    expect(screen.getByText("All 50 selected")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Archive selected" }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalled());
    const [, options] = apiFetch.mock.calls[0] as [string, { body: string }];
    expect(JSON.parse(options.body)).toEqual({
      allMatching: true,
      filter: "status:eq:active",
      tf: {
        featured: { value: "true" },
        updated_at: { from: "2026-01-01" },
      },
    });
  });

  it("opens the bulk action form as a sheet when the action carries modal presentation", () => {
    const sheetNode = {
      ...node,
      props: {
        ...node.props,
        bulkActions: [
          fakeNode({
            type: "action",
            id: "workbench.products.tag-selected",
            props: {
              label: "Tag selected",
              method: "patch",
              endpoint: "/lattice/bulk-actions/workbench.products.tag-selected",
              ref: "sealed-ref",
              form: fakeNode({ type: "form", schema: [] }),
              modalSide: "end",
              modalWidth: "2xl",
            },
          }),
        ],
      },
    } satisfies TableNode;

    render(<TableComponent node={sheetNode}>{null}</TableComponent>);

    fireEvent.click(screen.getByRole("checkbox", { name: "Select row 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Tag selected" }));

    const content = document.querySelector('[data-slot="dialog-content"]');
    expect(content).toHaveClass("end-0", "max-w-2xl");
  });
});
