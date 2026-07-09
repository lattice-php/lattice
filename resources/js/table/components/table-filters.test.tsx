import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { FilterData } from "@lattice-php/lattice/types/generated";
import { registry } from "@lattice-php/lattice/registry";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import type { TableColumn, TableNode } from "../types";
import TableComponent from "./table";

function col(key: string, label: string): TableColumn {
  return {
    key,
    type: "column.text",
    props: {
      label,
      width: "md",
      align: "start",
      sortable: false,
      toggleable: false,
      hiddenByDefault: false,
      filter: null,
    },
  };
}

const filters: FilterData[] = [
  {
    key: "status",
    label: "Status",
    type: "filter.select",
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
          multiple: true,
          searchable: false,
          placeholder: null,
        },
      },
    ],
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
    type: "filter.ternary",
    schema: [
      {
        type: "field.select",
        props: {
          name: "value",
          label: "Featured",
          options: [
            { label: "Yes", value: "true" },
            { label: "No", value: "false" },
          ],
          multiple: false,
          searchable: false,
          placeholder: "All",
        },
      },
    ],
    props: { trueLabel: "Yes", falseLabel: "No", placeholder: "All" },
  },
  {
    key: "created",
    label: "Created",
    type: "filter.date-range",
    schema: [
      { type: "field.date-input", props: { name: "from", label: "Created from" } },
      { type: "field.date-input", props: { name: "until", label: "Created until" } },
    ],
    props: {},
  },
  { key: "high", label: "High value", type: "filter.toggle", schema: [], props: {} },
];

function stubFetch() {
  const fetch = vi.fn<typeof globalThis.fetch>(async () =>
    Response.json({
      data: [{ name: "Alpha" }],
      pagination: {},
      state: {
        filters: [],
        page: 1,
        perPage: 25,
        sorts: [],
        tableFilters: {},
        tableFilterIndicators: [],
      },
    }),
  );

  vi.stubGlobal("fetch", fetch);

  return fetch;
}

function indicatorsFor(tableFilters: Record<string, unknown>) {
  const indicators = [];

  if (tableFilters.status) {
    indicators.push({ filter: "status", label: "Status", value: "Active, Draft" });
  }
  if (tableFilters.featured) {
    indicators.push({ filter: "featured", label: "Featured", value: "Yes" });
  }
  if (tableFilters.created) {
    indicators.push({ filter: "created", label: "Created", value: "2026-01-01" });
  }

  return indicators;
}

function node(tableFilters: Record<string, Record<string, unknown>>): TableNode {
  return {
    id: "workbench.products",
    type: "table",
    props: {
      columns: [col("name", "Name")],
      filters,
      data: [{ name: "Alpha" }],
      endpoint: "/lattice/tables/workbench.products",
      state: {
        filters: [],
        page: 1,
        perPage: 25,
        sorts: [],
        tableFilters,
        tableFilterIndicators: indicatorsFor(tableFilters),
      },
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

    renderWithRegistry(
      <TableComponent
        node={node({
          status: { value: ["active", "draft"] },
          featured: { value: "true" },
          created: { from: "2026-01-01", until: "" },
        })}
      />,
      registry,
    );

    expect(screen.getByText("Active, Draft")).toBeInTheDocument();
    expect(screen.getByText("2026-01-01")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Featured filter" })).toBeInTheDocument();
  });

  it("renders the filter trigger in the trailing header cell", () => {
    stubFetch();

    renderWithRegistry(<TableComponent node={node({})} />, registry);

    const trigger = screen.getByRole("button", { name: "Filters" });

    expect(trigger.closest('[role="columnheader"]')).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset all" })).not.toBeInTheDocument();
  });

  it("applies a ternary selection through the endpoint", async () => {
    const fetch = stubFetch();

    renderWithRegistry(<TableComponent node={node({})} />, registry);

    openFilters();
    fireEvent.click(screen.getByRole("button", { name: "Featured" }));
    fireEvent.click(screen.getByRole("option", { name: "No" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("tf%5Bfeatured%5D%5Bvalue%5D=false"),
        expect.anything(),
      );
    });
  });

  it("toggles a single value off the multi-select through the endpoint", async () => {
    const fetch = stubFetch();

    renderWithRegistry(
      <TableComponent node={node({ status: { value: ["active", "draft"] } })} />,
      registry,
    );

    openFilters();
    fireEvent.click(screen.getByRole("button", { name: "Status" }));
    fireEvent.click(screen.getByRole("option", { name: "Active" }));

    await waitFor(() => {
      const url = fetch.mock.calls.at(-1)?.[0];
      expect(url).toContain("tf%5Bstatus%5D%5Bvalue%5D%5B%5D=draft");
      expect(url).not.toContain("active");
    });
  });

  it("applies a date-range bound through the endpoint", async () => {
    const fetch = stubFetch();

    renderWithRegistry(<TableComponent node={node({})} />, registry);

    openFilters();
    fireEvent.input(await screen.findByLabelText("Created from"), {
      target: { value: "2026-03-01" },
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("tf%5Bcreated%5D%5Bfrom%5D=2026-03-01"),
        expect.anything(),
      );
    });
  });

  it("turns a toggle filter on through the endpoint", async () => {
    const fetch = stubFetch();

    renderWithRegistry(<TableComponent node={node({})} />, registry);

    openFilters();
    fireEvent.click(screen.getByRole("checkbox", { name: "High value" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("tf%5Bhigh%5D%5Bvalue%5D=1"),
        expect.anything(),
      );
    });
  });

  it("clears one filter through its indicator chip", async () => {
    const fetch = stubFetch();

    renderWithRegistry(
      <TableComponent
        node={node({ featured: { value: "true" }, status: { value: ["active"] } })}
      />,
      registry,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove Featured filter" }));

    await waitFor(() => {
      const url = fetch.mock.calls.at(-1)?.[0];
      expect(url).not.toContain("tf%5Bfeatured%5D");
      expect(url).toContain("tf%5Bstatus%5D%5Bvalue%5D%5B%5D=active");
    });
  });

  it("resets every filter", async () => {
    const fetch = stubFetch();

    renderWithRegistry(<TableComponent node={node({ featured: { value: "true" } })} />, registry);

    fireEvent.click(screen.getByRole("button", { name: "Reset all" }));

    await waitFor(() => {
      const url = fetch.mock.calls.at(-1)?.[0];
      expect(url).not.toContain("tf%5B");
    });
  });
});
