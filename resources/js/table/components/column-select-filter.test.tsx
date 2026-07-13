import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ColumnFilter } from "@lattice-php/lattice/types/generated";
import { registry } from "@lattice-php/lattice/registry";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import type { TableColumn, TableNode } from "@lattice-php/lattice/table/types";
import TableComponent from "./table";

function selectFilter(multiple: boolean): ColumnFilter {
  return {
    type: "text",
    operators: multiple ? ["in", "not_in"] : ["eq", "neq"],
    defaultOperator: multiple ? "in" : "eq",
    control: "filter.select",
    options: [
      { label: "Active", value: "active" },
      { label: "Draft", value: "draft" },
    ],
    clauseOptions: [],
    multiple,
    searchable: false,
  };
}

function clauseFilter(): ColumnFilter {
  return {
    type: "boolean",
    operators: ["eq", "neq", "empty"],
    defaultOperator: "eq",
    control: "filter.select",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "Unset", value: "unset" },
    ],
    clauseOptions: [
      { label: "Yes", value: "yes", clauses: [{ operator: "eq", value: "true" }] },
      { label: "No", value: "no", clauses: [{ operator: "eq", value: "false" }] },
      { label: "Unset", value: "unset", clauses: [{ operator: "empty", value: "" }] },
    ],
    multiple: false,
    searchable: false,
  };
}

function rangeFilter(): ColumnFilter {
  return {
    type: "date",
    operators: ["eq", "neq", "gte", "lte"],
    defaultOperator: "eq",
    control: "filter.select",
    options: [{ label: "June 2026", value: "june-2026" }],
    clauseOptions: [
      {
        label: "June 2026",
        value: "june-2026",
        clauses: [
          { operator: "gte", value: "2026-06-01" },
          { operator: "lte", value: "2026-06-30" },
        ],
      },
    ],
    multiple: false,
    searchable: false,
  };
}

function col(filter: ColumnFilter): TableColumn {
  return {
    key: "status",
    type: "column.text",
    props: {
      label: "Status",
      width: "md",
      align: "start",
      sortable: false,
      toggleable: false,
      hiddenByDefault: false,
      filter,
    },
  };
}

function stubFetch() {
  const fetch = vi.fn<typeof globalThis.fetch>(async () =>
    Response.json({
      data: [],
      pagination: {},
      query: { filters: [], page: 1, perPage: 25, sorts: [], tableFilters: {} },
    }),
  );

  vi.stubGlobal("fetch", fetch);

  return fetch;
}

function node(filter: ColumnFilter): TableNode {
  return {
    id: "workbench.products",
    type: "table",
    props: {
      columns: [col(filter)],
      data: [],
      endpoint: "/lattice/tables/workbench.products",
      query: { filters: [], page: 1, perPage: 25, sorts: [], tableFilters: {} },
    },
  } satisfies TableNode;
}

describe("column select filter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("emits an eq clause for a single select column", async () => {
    const fetch = stubFetch();

    renderWithRegistry(<TableComponent node={node(selectFilter(false))} />, registry);

    fireEvent.click(screen.getByRole("button", { name: "Status" }));
    fireEvent.click(screen.getByRole("option", { name: "Active" }));

    await waitFor(() => {
      expect(fetch.mock.calls.at(-1)?.[0]).toContain("filter=status%3Aeq%3Aactive");
    });
  });

  it("emits an in clause for a multiple select column", async () => {
    const fetch = stubFetch();

    renderWithRegistry(<TableComponent node={node(selectFilter(true))} />, registry);

    fireEvent.click(screen.getByRole("button", { name: "Status" }));
    fireEvent.click(screen.getByRole("option", { name: "Active" }));

    await waitFor(() => {
      expect(fetch.mock.calls.at(-1)?.[0]).toContain("filter=status%3Ain%3Aactive");
    });
  });

  it("supports a searchable column select that emits an eq clause", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async (input) => {
      if (String(input).includes("_search")) {
        return Response.json({ options: [{ label: "Active", value: "active" }] });
      }

      return Response.json({
        data: [],
        pagination: {},
        query: { filters: [], page: 1, perPage: 25, sorts: [], tableFilters: {} },
      });
    });

    vi.stubGlobal("fetch", fetch);

    renderWithRegistry(
      <TableComponent node={node({ ...selectFilter(false), searchable: true })} />,
      registry,
    );

    fireEvent.click(screen.getByRole("button", { name: "Status" }));
    fireEvent.click(await screen.findByRole("option", { name: "Active" }));

    await waitFor(() => {
      expect(fetch.mock.calls.at(-1)?.[0]).toContain("filter=status%3Aeq%3Aactive");
    });
  });

  it("emits a valueless clause when a clause option is chosen", async () => {
    const fetch = stubFetch();

    renderWithRegistry(<TableComponent node={node(clauseFilter())} />, registry);

    fireEvent.click(screen.getByRole("button", { name: "Status" }));
    fireEvent.click(screen.getByRole("option", { name: "Unset" }));

    await waitFor(() => {
      expect(fetch.mock.calls.at(-1)?.[0]).toContain("filter=status%3Aempty%3A");
    });
  });

  it("emits multiple clauses when a range clause option is chosen", async () => {
    const fetch = stubFetch();

    renderWithRegistry(<TableComponent node={node(rangeFilter())} />, registry);

    fireEvent.click(screen.getByRole("button", { name: "Status" }));
    fireEvent.click(screen.getByRole("option", { name: "June 2026" }));

    await waitFor(() => {
      expect(decodeURIComponent(String(fetch.mock.calls.at(-1)?.[0]))).toContain(
        "filter=status:gte:2026-06-01,status:lte:2026-06-30",
      );
    });
  });

  it("does not render the operator popover for a select column", () => {
    stubFetch();

    renderWithRegistry(<TableComponent node={node(selectFilter(false))} />, registry);

    expect(screen.queryByRole("button", { name: "Status filters" })).not.toBeInTheDocument();
  });
});
