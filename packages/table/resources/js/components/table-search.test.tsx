import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { registry } from "@lattice-php/lattice/registry";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import type { TableColumn, TableNode } from "@lattice-php/table/types";
import TableComponent from "./table";

function col(): TableColumn {
  return {
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
    },
  };
}

function node(searchable: boolean): TableNode {
  return {
    id: "workbench.searchable",
    type: "table",
    props: {
      columns: [col()],
      data: [],
      searchable,
      endpoint: "/lattice/tables/workbench.searchable",
      query: {
        filters: [],
        page: 1,
        perPage: 25,
        sorts: [],
        tableFilters: {},
        tableFilterIndicators: [],
        search: "",
      },
    },
  };
}

function stubFetch() {
  const fetch = vi.fn<typeof globalThis.fetch>(async (input) => {
    const url = new URL(String(input), "http://localhost");

    return Response.json({
      data: [],
      pagination: {},
      query: {
        filters: [],
        page: 1,
        perPage: 25,
        sorts: [],
        tableFilters: {},
        tableFilterIndicators: [],
        search: url.searchParams.get("q") ?? "",
      },
    });
  });

  vi.stubGlobal("fetch", fetch);

  return fetch;
}

describe("global table search", () => {
  it("issues a debounced q request as the user types", async () => {
    const fetch = stubFetch();

    renderWithRegistry(<TableComponent node={node(true)} />, registry);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "acme" } });

    await waitFor(() => {
      expect(fetch.mock.calls.some((call) => String(call[0]).includes("q=acme"))).toBe(true);
    });
  });

  it("clears the term through the clear button", async () => {
    const fetch = stubFetch();

    renderWithRegistry(<TableComponent node={node(true)} />, registry);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "acme" } });

    await waitFor(() => {
      expect(fetch.mock.calls.some((call) => String(call[0]).includes("q=acme"))).toBe(true);
    });

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    await waitFor(() => {
      expect(String(fetch.mock.calls.at(-1)?.[0])).not.toContain("q=acme");
    });
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });
});
