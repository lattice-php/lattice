import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ColumnData, FilterData } from "@lattice-php/lattice/types/generated";
import type { TableNode } from "../types";
import TableComponent from "./table";

const filter: FilterData = {
  key: "author",
  label: "Author",
  type: "select",
  props: {
    options: [{ label: "Ada", value: "1" }],
    multiple: false,
    searchable: true,
    placeholder: null,
  },
};

function col(): ColumnData {
  return {
    key: "name",
    label: "Name",
    type: "text",
    width: "md",
    sortable: null,
    filter: null,
    columns: null,
    props: null,
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
    state: { filters: [], page: 1, perPage: 25, sorts: [], tableFilters: {} },
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
      state: { filters: [], page: 1, perPage: 25, sorts: [], tableFilters: {} },
    });
  });

  vi.stubGlobal("fetch", fetch);

  return fetch;
}

describe("searchable select filter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("applies the chosen option through the table endpoint", async () => {
    const fetch = stubFetch();

    render(<TableComponent node={node} />);

    fireEvent.click(screen.getByRole("button", { name: "Author" }));
    fireEvent.click(await screen.findByRole("button", { name: "Ada" }));

    await waitFor(() => {
      expect(fetch.mock.calls.at(-1)?.[0]).toContain("tf%5Bauthor%5D=1");
    });
  });

  it("toggles values in a searchable multi-select", async () => {
    const fetch = stubFetch();
    const multiNode: TableNode = {
      ...node,
      props: {
        ...node.props,
        filters: [{ ...filter, props: { ...filter.props, multiple: true } }],
      },
    };

    render(<TableComponent node={multiNode} />);

    fireEvent.click(screen.getByRole("button", { name: "Author" }));
    fireEvent.click(await screen.findByRole("button", { name: "Ada" }));

    await waitFor(() => {
      expect(fetch.mock.calls.at(-1)?.[0]).toContain("tf%5Bauthor%5D%5B%5D=1");
    });
  });

  it("issues a _search request as the user types", async () => {
    const fetch = stubFetch();

    render(<TableComponent node={node} />);

    fireEvent.click(screen.getByRole("button", { name: "Author" }));
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "ad" } });

    await waitFor(() => {
      expect(fetch.mock.calls.some((call) => String(call[0]).includes("_search=author&q=ad"))).toBe(
        true,
      );
    });
  });
});
