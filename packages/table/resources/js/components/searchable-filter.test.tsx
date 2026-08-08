import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { registry } from "@lattice-php/lattice/registry";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import type { FilterNode, TableNode } from "@lattice-php/table/types";
import { col, searchFetch, tableNode } from "../test-support";
import TableComponent from "./table";

const filter: FilterNode = {
  key: "author",
  type: "filter.select",
  props: {
    label: "Author",
    options: [{ label: "Ada", value: "1", data: null }],
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

const node: TableNode = tableNode({
  columns: [col({ key: "name", label: "Name" })],
  filters: [filter],
});

function stubFetch() {
  return searchFetch([
    { label: "Ada", value: "1" },
    { label: "Adam", value: "4" },
  ]);
}

function openFilters(): void {
  fireEvent.click(screen.getByRole("button", { name: "Filters" }));
}

describe("searchable select filter", () => {
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

  it("issues a search sub-request as the user types", async () => {
    const fetch = stubFetch();

    renderWithRegistry(<TableComponent node={node} />, registry);

    openFilters();
    fireEvent.click(screen.getByRole("button", { name: "Author" }));
    fireEvent.change(screen.getByLabelText("Search options"), { target: { value: "ad" } });

    await waitFor(() => {
      expect(
        fetch.mock.calls.some((call) =>
          String(call[0]).includes("_sub=search&_target=filter%3Aauthor.value&_q=ad"),
        ),
      ).toBe(true);
    });
  });
});
