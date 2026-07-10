import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { registry } from "@lattice-php/lattice/registry";
import { renderWithRegistry } from "@lattice-php/lattice/test/render";
import type { FilterNode, TableColumn, TableNode } from "../types";
import TableComponent from "./table";

const filter: FilterNode = {
  key: "author",
  type: "filter.select",
  props: {
    label: "Author",
    options: [{ label: "Ada", value: "1" }],
    multiple: false,
    searchable: true,
    placeholder: null,
  },
  schema: [
    {
      type: "field.select",
      props: {
        name: "value",
        label: "Author",
        options: [{ label: "Ada", value: "1" }],
        multiple: false,
        searchable: true,
        placeholder: null,
      },
    },
  ],
};

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

const node: TableNode = {
  id: "workbench.products",
  type: "table",
  props: {
    columns: [col()],
    filters: [filter],
    data: [],
    endpoint: "/lattice/tables/workbench.products",
    state: {
      filters: [],
      page: 1,
      perPage: 25,
      sorts: [],
      tableFilters: {},
      tableFilterIndicators: [],
    },
  },
};

function stubFetch() {
  const fetch = vi.fn<typeof globalThis.fetch>(async (input) => {
    if (String(input).includes("_search")) {
      return Response.json({
        options: [
          { label: "Ada", value: "1" },
          { label: "Adam", value: "4" },
        ],
      });
    }

    return Response.json({
      data: [],
      pagination: {},
      state: {
        filters: [],
        page: 1,
        perPage: 25,
        sorts: [],
        tableFilters: {},
        tableFilterIndicators: [],
      },
    });
  });

  vi.stubGlobal("fetch", fetch);

  return fetch;
}

function openFilters(): void {
  fireEvent.click(screen.getByRole("button", { name: "Filters" }));
}

describe("searchable select filter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("applies the chosen option through the table endpoint", async () => {
    const fetch = stubFetch();

    renderWithRegistry(<TableComponent node={node} />, registry);

    openFilters();
    fireEvent.click(screen.getByRole("button", { name: "Author" }));
    fireEvent.click(await screen.findByRole("option", { name: "Ada" }));

    await waitFor(() => {
      expect(fetch.mock.calls.at(-1)?.[0]).toContain("tf%5Bauthor%5D%5Bvalue%5D=1");
    });
  });

  it("toggles values in a searchable multi-select", async () => {
    const fetch = stubFetch();
    const multiNode: TableNode = {
      ...node,
      props: {
        ...node.props,
        filters: [
          {
            ...filter,
            schema: [
              {
                type: "field.select",
                props: {
                  ...filter.schema?.[0]?.props,
                  multiple: true,
                },
              },
            ],
            props: { ...filter.props, multiple: true },
          },
        ],
      },
    };

    renderWithRegistry(<TableComponent node={multiNode} />, registry);

    openFilters();
    fireEvent.click(screen.getByRole("button", { name: "Author" }));
    fireEvent.click(await screen.findByRole("option", { name: "Ada" }));

    await waitFor(() => {
      expect(fetch.mock.calls.at(-1)?.[0]).toContain("tf%5Bauthor%5D%5Bvalue%5D%5B%5D=1");
    });
  });

  it("issues a _search request as the user types", async () => {
    const fetch = stubFetch();

    renderWithRegistry(<TableComponent node={node} />, registry);

    openFilters();
    fireEvent.click(screen.getByRole("button", { name: "Author" }));
    fireEvent.change(screen.getByLabelText("Search options"), { target: { value: "ad" } });

    await waitFor(() => {
      expect(
        fetch.mock.calls.some((call) =>
          String(call[0]).includes("_search=filter%3Aauthor.value&q=ad"),
        ),
      ).toBe(true);
    });
  });
});
