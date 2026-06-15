import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ColumnData, ColumnFilter } from "@lattice-php/lattice/types/generated";
import type { TableNode } from "../types";
import TableComponent from "./table";

function selectFilter(multiple: boolean): ColumnFilter {
  return {
    enabled: true,
    type: "text",
    operators: multiple ? ["in", "not_in"] : ["eq", "neq"],
    defaultOperator: multiple ? "in" : "eq",
    control: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Draft", value: "draft" },
    ],
    multiple,
    searchable: false,
  };
}

function col(filter: ColumnFilter): ColumnData {
  return {
    key: "status",
    label: "Status",
    type: "text",
    width: "md",
    sortable: null,
    filter,
    columns: null,
    props: null,
    align: "start",
  };
}

function stubFetch() {
  const fetch = vi.fn<typeof globalThis.fetch>(async () =>
    Response.json({
      data: [],
      pagination: {},
      state: { filters: [], page: 1, perPage: 25, sorts: [], tableFilters: {} },
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
      state: { filters: [], page: 1, perPage: 25, sorts: [], tableFilters: {} },
    },
  } satisfies TableNode;
}

describe("column select filter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("emits an eq clause for a single select column", async () => {
    const fetch = stubFetch();

    render(<TableComponent node={node(selectFilter(false))} />);

    fireEvent.change(screen.getByRole("combobox", { name: "Status" }), {
      target: { value: "active" },
    });

    await waitFor(() => {
      expect(fetch.mock.calls.at(-1)?.[0]).toContain("filter=status%3Aeq%3Aactive");
    });
  });

  it("emits an in clause for a multiple select column", async () => {
    const fetch = stubFetch();

    render(<TableComponent node={node(selectFilter(true))} />);

    fireEvent.click(screen.getByRole("button", { name: "Status" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Active" }));

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
        state: { filters: [], page: 1, perPage: 25, sorts: [], tableFilters: {} },
      });
    });

    vi.stubGlobal("fetch", fetch);

    render(<TableComponent node={node({ ...selectFilter(false), searchable: true })} />);

    fireEvent.click(screen.getByRole("button", { name: "Status" }));
    fireEvent.click(await screen.findByRole("option", { name: "Active" }));

    await waitFor(() => {
      expect(fetch.mock.calls.at(-1)?.[0]).toContain("filter=status%3Aeq%3Aactive");
    });
  });

  it("does not render the operator popover for a select column", () => {
    stubFetch();

    render(<TableComponent node={node(selectFilter(false))} />);

    expect(screen.queryByRole("button", { name: "Status filters" })).not.toBeInTheDocument();
  });
});
