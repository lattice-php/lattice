import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ColumnData, FilterData } from "@lattice-php/lattice/types/generated";
import type { TableNode } from "../types";
import TableComponent from "./table";

function col(key: string, label: string): ColumnData {
  return {
    key,
    label,
    type: "column.text",
    width: "md",
    sortable: null,
    filter: null,
    columns: null,
    props: null,
    align: "start",
  };
}

const filters: FilterData[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    props: {
      options: [
        { label: "Active", value: "active" },
        { label: "Draft", value: "draft" },
      ],
      multiple: true,
      searchable: false,
      placeholder: null,
    },
  },
  {
    key: "featured",
    label: "Featured",
    type: "ternary",
    props: { trueLabel: "Yes", falseLabel: "No", placeholder: "All" },
  },
  { key: "created", label: "Created", type: "date-range", props: {} },
  { key: "high", label: "High value", type: "toggle", props: {} },
];

function stubFetch() {
  const fetch = vi.fn<typeof globalThis.fetch>(async () =>
    Response.json({
      data: [{ name: "Alpha" }],
      pagination: {},
      state: { filters: [], page: 1, perPage: 25, sorts: [], tableFilters: {} },
    }),
  );

  vi.stubGlobal("fetch", fetch);

  return fetch;
}

function node(tableFilters: Record<string, unknown>): TableNode {
  return {
    id: "workbench.products",
    type: "table",
    props: {
      columns: [col("name", "Name")],
      filters,
      data: [{ name: "Alpha" }],
      endpoint: "/lattice/tables/workbench.products",
      state: { filters: [], page: 1, perPage: 25, sorts: [], tableFilters },
    },
  } satisfies TableNode;
}

function openFilters(): void {
  fireEvent.click(screen.getByRole("button", { name: "Filters" }));
}

describe("dedicated table filters in the table component", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders an active-value chip per dedicated filter type", () => {
    stubFetch();

    render(
      <TableComponent
        node={node({
          status: ["active", "draft"],
          featured: "true",
          created: { from: "2026-01-01", until: "" },
        })}
      />,
    );

    expect(screen.getByText("Active, Draft")).toBeInTheDocument();
    expect(screen.getByText("2026-01-01")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Featured filter" })).toBeInTheDocument();
  });

  it("renders the filter trigger in the trailing header cell", () => {
    stubFetch();

    render(<TableComponent node={node({})} />);

    const trigger = screen.getByRole("button", { name: "Filters" });

    expect(trigger.closest('[role="columnheader"]')).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset all" })).not.toBeInTheDocument();
  });

  it("applies a ternary selection through the endpoint", async () => {
    const fetch = stubFetch();

    render(<TableComponent node={node({})} />);

    openFilters();
    fireEvent.change(screen.getByLabelText("Featured"), { target: { value: "false" } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("tf%5Bfeatured%5D=false"),
        expect.anything(),
      );
    });
  });

  it("toggles a single value off the multi-select through the endpoint", async () => {
    const fetch = stubFetch();

    render(<TableComponent node={node({ status: ["active", "draft"] })} />);

    openFilters();
    fireEvent.click(screen.getByRole("button", { name: "Status" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Active" }));

    await waitFor(() => {
      const url = fetch.mock.calls.at(-1)?.[0];
      expect(url).toContain("tf%5Bstatus%5D%5B%5D=draft");
      expect(url).not.toContain("active");
    });
  });

  it("applies a date-range bound through the endpoint", async () => {
    const fetch = stubFetch();

    render(<TableComponent node={node({})} />);

    openFilters();
    fireEvent.change(screen.getByLabelText("Created from"), { target: { value: "2026-03-01" } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("tf%5Bcreated%5D%5Bfrom%5D=2026-03-01"),
        expect.anything(),
      );
    });
  });

  it("turns a toggle filter on through the endpoint", async () => {
    const fetch = stubFetch();

    render(<TableComponent node={node({})} />);

    openFilters();
    fireEvent.click(screen.getByRole("checkbox", { name: "High value" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("tf%5Bhigh%5D=1"),
        expect.anything(),
      );
    });
  });

  it("clears one filter through its indicator chip", async () => {
    const fetch = stubFetch();

    render(<TableComponent node={node({ featured: "true", status: ["active"] })} />);

    fireEvent.click(screen.getByRole("button", { name: "Remove Featured filter" }));

    await waitFor(() => {
      const url = fetch.mock.calls.at(-1)?.[0];
      expect(url).not.toContain("tf%5Bfeatured%5D");
      expect(url).toContain("tf%5Bstatus%5D%5B%5D=active");
    });
  });

  it("resets every filter", async () => {
    const fetch = stubFetch();

    render(<TableComponent node={node({ featured: "true" })} />);

    fireEvent.click(screen.getByRole("button", { name: "Reset all" }));

    await waitFor(() => {
      const url = fetch.mock.calls.at(-1)?.[0];
      expect(url).not.toContain("tf%5B");
    });
  });
});
