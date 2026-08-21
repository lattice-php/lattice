import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ColumnFilter } from "@lattice-php/table";
import { registry } from "@lattice-php/lattice/registry";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import type { TableNode } from "@lattice-php/table/types";
import { col, searchFetch, tableFetch, tableNode } from "../test-support";
import { TableComponent } from "./table";

function selectFilter(): ColumnFilter {
  return {
    type: "text",
    operators: ["eq", "neq"],
    defaultOperator: "eq",
    control: "filter.select",
    options: [
      { label: "Active", value: "active", data: null },
      { label: "Draft", value: "draft", data: null },
    ],
    clauseOptions: [],
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
    options: [{ label: "June 2026", value: "june-2026", data: null }],
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

function node(filter: ColumnFilter): TableNode {
  return tableNode({ columns: [col({ key: "status", label: "Status", filter })] });
}

describe("column select filter", () => {
  it("supports a searchable column select that emits an eq clause", async () => {
    const fetch = searchFetch([{ label: "Active", value: "active" }]);

    renderWithRegistry(
      <TableComponent node={node({ ...selectFilter(), searchable: true })} />,
      registry,
    );

    fireEvent.click(screen.getByRole("button", { name: "Status" }));
    fireEvent.click(await screen.findByRole("option", { name: "Active" }));

    await waitFor(() => {
      expect(fetch.mock.calls.at(-1)?.[0]).toContain("filter=status%3Aeq%3Aactive");
    });
  });

  it("emits multiple clauses when a range clause option is chosen", async () => {
    const fetch = tableFetch();

    renderWithRegistry(<TableComponent node={node(rangeFilter())} />, registry);

    fireEvent.click(screen.getByRole("button", { name: "Status" }));
    fireEvent.click(screen.getByRole("option", { name: "June 2026" }));

    await waitFor(() => {
      expect(decodeURIComponent(String(fetch.mock.calls.at(-1)?.[0]))).toContain(
        "filter=status:gte:2026-06-01,status:lte:2026-06-30",
      );
    });
  });
});
