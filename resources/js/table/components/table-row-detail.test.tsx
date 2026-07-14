import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { registry } from "@lattice-php/lattice/registry";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import type { TableColumn, TableNode, TableRow } from "@lattice-php/lattice/table/types";
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

function detailNode(id: string) {
  return {
    type: "fragment",
    id: `detail-${id}`,
    props: { lazy: true, endpoint: `/lattice/fragments/detail-${id}`, ref: "sig", size: "md" },
  };
}

function node(rows: TableRow[]): TableNode {
  return {
    id: "workbench.orders",
    type: "table",
    props: {
      columns: [col()],
      data: rows,
      endpoint: "/lattice/tables/workbench.orders",
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

function stubFetch(text: string) {
  const fetch = vi.fn<typeof globalThis.fetch>(async () =>
    Response.json({ schema: [{ type: "text", props: { text } }] }),
  );

  vi.stubGlobal("fetch", fetch);

  return fetch;
}

describe("expandable table rows", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders an expander only for rows that carry a detail", () => {
    renderWithRegistry(
      <TableComponent
        node={node([
          { id: "1", name: "Order 1", detail: detailNode("1") },
          { id: "2", name: "Order 2" },
        ])}
      />,
      registry,
    );

    expect(screen.getAllByRole("button", { name: "Toggle detail" })).toHaveLength(1);
  });

  it("loads the detail fragment over AJAX on expand and hides it on collapse", async () => {
    const fetch = stubFetch("Line items loaded");

    renderWithRegistry(
      <TableComponent node={node([{ id: "1", name: "Order 1", detail: detailNode("1") }])} />,
      registry,
    );

    expect(screen.queryByText("Line items loaded")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Toggle detail" }));

    await waitFor(() => {
      expect(screen.getByText("Line items loaded")).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/lattice/fragments/detail-1"),
      expect.anything(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle detail" }));

    await waitFor(() => {
      expect(screen.queryByText("Line items loaded")).toBeNull();
    });
  });
});
