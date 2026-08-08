import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@lattice-php/lattice/provider";
import { afterEach, describe, expect, it } from "vitest";
import type { TableNode } from "@lattice-php/table/types";
import { fakeNode } from "@lattice-php/core/test-support";
import { col, pagination, requestOptions, tableFetch, tableQuery } from "../test-support";
import TableComponent from "./table";

describe("Lattice table component", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("derives per-column sort state from the server query", () => {
    const node = {
      id: "workbench.users",
      props: {
        columns: [
          col({ key: "name", label: "Name", sortable: true }),
          col({ key: "email", label: "Email", sortable: true }),
        ],
        data: [],
        endpoint: "/lattice/tables/workbench.users",
        query: tableQuery({
          sorts: [
            { key: "name", direction: "asc" },
            { key: "email", direction: "desc" },
          ],
        }),
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    expect(
      screen.getByRole("button", { name: "Sort Name" }).closest('[role="columnheader"]'),
    ).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getByText("1. Name")).toBeVisible();
    expect(screen.getByText("2. Email")).toBeVisible();
    expect(screen.getByRole("img", { name: "ascending" })).toBeVisible();
    expect(screen.getByRole("img", { name: "descending" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Clear Name sort" })).toBeVisible();
  });

  it("refreshes rows when table data props change", () => {
    const node = {
      id: "workbench.users",
      props: {
        columns: [
          col({
            key: "name",
            label: "Name",
          }),
        ],
        data: [{ name: "Taylor" }],
        endpoint: "/lattice/tables/workbench.users",
        query: tableQuery(),
      },
      type: "table",
    } satisfies TableNode;

    const { rerender } = render(<TableComponent node={node}>{null}</TableComponent>);

    expect(screen.getByRole("cell", { name: "Taylor" })).toBeVisible();

    rerender(
      <TableComponent
        node={{
          ...node,
          props: {
            ...node.props,
            data: [{ name: "Nuno" }],
          },
        }}
      >
        {null}
      </TableComponent>,
    );

    expect(screen.getByRole("cell", { name: "Nuno" })).toBeVisible();
    expect(screen.queryByRole("cell", { name: "Taylor" })).not.toBeInTheDocument();
  });

  it("renders column resize handles only when enabled", () => {
    const node = {
      id: "workbench.products",
      props: {
        columns: [
          col({
            key: "qty",
            label: "Qty",
          }),
        ],
        data: [],
        query: tableQuery(),
      },
      type: "table",
    } satisfies TableNode;

    const { rerender } = render(<TableComponent node={node}>{null}</TableComponent>);

    expect(screen.queryByRole("separator", { name: "Resize Qty" })).not.toBeInTheDocument();

    rerender(
      <TableComponent node={{ ...node, props: { ...node.props, resizableColumns: true } }}>
        {null}
      </TableComponent>,
    );

    expect(screen.getByRole("separator", { name: "Resize Qty" })).toBeInTheDocument();
  });

  it("gathers search, filters, column visibility, resize reset, and slot nodes into one toolbar row, with slot nodes rightmost", () => {
    window.localStorage.setItem(
      "lattice:table-columns:workbench.toolbar",
      JSON.stringify({ overrides: { name: 180 } }),
    );

    const node = {
      id: "workbench.toolbar",
      props: {
        columns: [
          col({ key: "name", label: "Name" }),
          col({ key: "notes", label: "Notes", props: { toggleable: true } }),
        ],
        data: [],
        searchable: true,
        resizableColumns: true,
        filters: [
          {
            key: "status",
            type: "filter.select",
            props: {
              label: "Status",
              options: [],
              multiple: false,
              searchable: false,
              placeholder: null,
            },
            schema: [],
          },
        ],
        toolbar: [fakeNode({ type: "text", props: { text: "Custom slot" } })],
        endpoint: "/lattice/tables/workbench.toolbar",
        query: tableQuery(),
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    const toolbar = screen.getByTestId("table-search").closest('[data-slot="table-toolbar"]');

    expect(toolbar).not.toBeNull();
    expect(toolbar).toContainElement(screen.getByTestId("table-search"));
    expect(toolbar).toContainElement(screen.getByText("Custom slot"));
    expect(toolbar).toContainElement(screen.getByTestId("table-filters-menu"));
    expect(toolbar).toContainElement(screen.getByTestId("table-columns-menu"));
    expect(toolbar).toContainElement(screen.getByTestId("table-reset-columns"));
    expect(screen.getByTestId("table-reset-columns")).not.toHaveClass("absolute");

    const resetColumns = screen.getByTestId("table-reset-columns");
    const slot = screen.getByText("Custom slot");
    expect(resetColumns.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("renders grid rows with stack columns and row actions without table cells", async () => {
    const node = {
      id: "workbench.stacked-users",
      props: {
        columns: [
          col({
            key: "identity",
            label: "Identity",
            type: "column.stack",
            schema: [fakeNode({ type: "text", props: { dataBindings: { text: "name" } } })],
          }),
          col({
            key: "status",
            label: "Status",
            type: "column.text",
          }),
        ],
        data: [
          {
            id: 2,
            name: "Taylor",
            email: "taylor@example.com",
            status: "Active",
            actions: [
              {
                schema: [
                  {
                    id: "workbench.ping",
                    props: {
                      endpoint: "/lattice/actions/workbench.ping",
                      label: "Ping",
                      method: "post",
                      variant: "secondary",
                    },
                    type: "action",
                  },
                  {
                    props: {
                      href: "/products/2/edit",
                      label: "Edit",
                    },
                    type: "link",
                  },
                ],
                id: "workbench.user-actions",
                props: {
                  label: "Manage user",
                },
                type: "action.group",
              },
            ],
          },
        ],
        layout: "grid",
        query: tableQuery(),
      },
      type: "table",
    } satisfies TableNode;

    const { container } = render(<TableComponent node={node}>{null}</TableComponent>);

    expect(container.querySelector("td")).not.toBeInTheDocument();
    expect(screen.getByRole("table")).toBeVisible();
    expect(screen.getByRole("cell", { name: "Active" })).toBeVisible();
    expect(await screen.findByRole("button", { name: "Manage user" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Manage user" }));

    const action = await screen.findByRole("button", { name: "Ping" });
    const link = screen.getByRole("link", { name: "Edit" });

    expect(action).toBeVisible();
    expect(link).toHaveAttribute("href", "/products/2/edit");
  });

  it("adds and clears individual sorts through the table endpoint", async () => {
    const fetch = tableFetch({
      query: tableQuery({
        sorts: [
          { key: "name", direction: "asc" },
          { key: "email", direction: "asc" },
        ],
      }),
    });

    const node = {
      id: "workbench.users",
      props: {
        columns: [
          col({
            key: "name",
            label: "Name",
            sortable: true,
          }),
          col({
            key: "email",
            label: "Email",
            sortable: true,
          }),
        ],
        data: [],
        endpoint: "/lattice/tables/workbench.users",
        query: tableQuery({ sorts: [{ key: "name", direction: "asc" }] }),
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Sort Email" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/lattice/tables/workbench.users?sort=name%2Cemail&page=1&per_page=25",
        requestOptions(),
      );
    });

    await screen.findByText("2. Email");

    fireEvent.click(screen.getByRole("button", { name: "Clear Email sort" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith(
        "/lattice/tables/workbench.users?sort=name&page=1&per_page=25",
        requestOptions(),
      );
    });
  });

  it("sends component refs with table state requests", async () => {
    const fetch = tableFetch({
      query: tableQuery({ sorts: [{ key: "name", direction: "asc" }] }),
    });

    const node = {
      id: "teams.members",
      props: {
        columns: [
          col({
            key: "name",
            label: "Name",
            sortable: true,
          }),
        ],
        data: [],
        endpoint: "/lattice/tables/teams.members",
        ref: "sealed-reference",
        query: tableQuery(),
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Sort Name" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/lattice/tables/teams.members?sort=name&page=1&per_page=25",
        requestOptions({ "X-Lattice-Ref": "sealed-reference" }),
      );
    });
  });

  it("reloads itself when a matching reload component event is dispatched", async () => {
    const fetch = tableFetch({
      data: [{ id: 2, name: "Ada" }],
      pagination: pagination({
        mode: "none",
      }),
    });

    const node = {
      id: "settings.passkeys",
      props: {
        columns: [
          col({
            key: "name",
            label: "Name",
          }),
        ],
        data: [{ id: 1, name: "Taylor" }],
        endpoint: "/lattice/tables/settings.passkeys",
        pagination: pagination(),
        query: tableQuery(),
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    window.dispatchEvent(
      new CustomEvent("lattice:reload-component", {
        detail: {
          component: "settings.passkeys",
          type: "reload-component",
        },
      }),
    );

    await screen.findByRole("cell", { name: "Ada" });

    expect(fetch).toHaveBeenCalledWith(
      "/lattice/tables/settings.passkeys?page=1&per_page=25",
      requestOptions(),
    );
    expect(screen.queryByRole("cell", { name: "Taylor" })).not.toBeInTheDocument();
  });

  it("appends infinite table rows and resets them when sorting", async () => {
    const fetch = tableFetch(
      {
        data: [{ id: 2, name: "Ada" }],
        pagination: pagination({
          currentPage: 2,
          hasMore: false,
          mode: "infinite",
          nextPage: null,
          perPage: 1,
        }),
        query: tableQuery({ page: 2, perPage: 1 }),
      },
      {
        data: [{ id: 3, name: "Grace" }],
        pagination: pagination({
          currentPage: 1,
          hasMore: false,
          mode: "infinite",
          nextPage: null,
          perPage: 1,
        }),
        query: tableQuery({ perPage: 1, sorts: [{ key: "name", direction: "asc" }] }),
      },
    );

    const node = {
      id: "workbench.users",
      props: {
        columns: [
          col({
            key: "name",
            label: "Name",
            sortable: true,
          }),
        ],
        data: [{ id: 1, name: "Taylor" }],
        endpoint: "/lattice/tables/workbench.users",
        pagination: pagination({
          mode: "infinite",
          currentPage: 1,
          perPage: 1,
          hasMore: true,
          nextPage: 2,
        }),
        query: tableQuery({ perPage: 1 }),
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));

    await screen.findByRole("cell", { name: "Ada" });

    expect(screen.getByRole("cell", { name: "Taylor" })).toBeVisible();
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "/lattice/tables/workbench.users?page=2&per_page=1",
      requestOptions(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Sort Name" }));

    await screen.findByRole("cell", { name: "Grace" });

    expect(screen.queryByRole("cell", { name: "Taylor" })).not.toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "Ada" })).not.toBeInTheDocument();
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/lattice/tables/workbench.users?sort=name&page=1&per_page=1",
      requestOptions(),
    );
  });

  it("renders small tables without pagination controls", () => {
    const node = {
      id: "workbench.small-users",
      props: {
        columns: [
          col({
            key: "name",
            label: "Name",
          }),
        ],
        data: [{ id: 1, name: "Taylor" }],
        pagination: pagination({ total: 1 }),
        query: tableQuery(),
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    expect(screen.getByRole("cell", { name: "Taylor" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Previous" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
  });

  it("renders numbered controls for table pagination", async () => {
    const fetch = tableFetch({
      data: [{ id: 3, name: "Grace" }],
      pagination: {
        currentPage: 3,
        hasMore: true,
        lastPage: 4,
        mode: "table",
        nextPage: 4,
        perPage: 1,
        from: 3,
        to: 3,
        total: 4,
      },
      query: tableQuery({ page: 3, perPage: 1 }),
    });

    const node = {
      id: "workbench.users",
      props: {
        columns: [
          col({
            key: "name",
            label: "Name",
          }),
        ],
        data: [{ id: 2, name: "Ada" }],
        endpoint: "/lattice/tables/workbench.users",
        pagination: {
          currentPage: 2,
          hasMore: true,
          lastPage: 4,
          mode: "table",
          nextPage: 3,
          perPage: 1,
          from: 2,
          to: 2,
          total: 4,
        },
        query: tableQuery({ page: 2, perPage: 1 }),
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Showing 2-2 of 4")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));

    await screen.findByRole("cell", { name: "Grace" });

    expect(fetch).toHaveBeenCalledWith(
      "/lattice/tables/workbench.users?page=3&per_page=1",
      requestOptions(),
    );
  });

  it("loads lazy table data after the component mounts", async () => {
    const fetch = tableFetch({
      data: [{ id: 1, name: "Ada" }],
      pagination: pagination({
        currentPage: 1,
        hasMore: false,
        mode: "none",
        total: 1,
        from: 1,
        to: 1,
      }),
    });

    const node = {
      id: "workbench.users.none",
      props: {
        columns: [
          col({
            key: "name",
            label: "Name",
          }),
        ],
        data: [],
        endpoint: "/lattice/tables/workbench.users.none",
        lazy: true,
        pagination: pagination(),
        query: tableQuery(),
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    expect(screen.getByText("Loading rows...")).toBeVisible();

    await screen.findByRole("cell", { name: "Ada" });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "/lattice/tables/workbench.users.none?page=1&per_page=25",
      requestOptions(),
    );
    expect(screen.getByText("Showing 1-1 of 1")).toBeVisible();
  });

  it("applies per-column header filters by type", async () => {
    const fetch = tableFetch();

    const node = {
      id: "workbench.products",
      props: {
        columns: [
          col({
            key: "name",
            label: "Name",
            filter: {
              type: "text",
              operators: ["contains", "eq", "neq"],
              defaultOperator: "contains",
              control: null,
              options: [],
              multiple: false,
              searchable: false,
              clauseOptions: [],
            },
          }),
          col({
            key: "featured",
            label: "Featured",
            filter: {
              type: "boolean",
              operators: ["eq"],
              defaultOperator: "eq",
              control: null,
              options: [],
              multiple: false,
              searchable: false,
              clauseOptions: [],
            },
          }),
          col({
            key: "updated_at",
            label: "Updated",
            filter: {
              type: "date",
              operators: ["eq", "before", "after"],
              defaultOperator: "eq",
              control: null,
              options: [],
              multiple: false,
              searchable: false,
              clauseOptions: [],
            },
          }),
        ],
        data: [],
        endpoint: "/lattice/tables/workbench.products",
        query: tableQuery(),
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    fireEvent.change(screen.getByRole("combobox", { name: "Filter Featured" }), {
      target: { value: "true" },
    });
    await waitFor(() =>
      expect(fetch).toHaveBeenLastCalledWith(
        "/lattice/tables/workbench.products?filter=featured%3Aeq%3Atrue&page=1&per_page=25",
        requestOptions(),
      ),
    );

    fireEvent.change(screen.getByLabelText("Filter Updated"), {
      target: { value: "2026-06-01" },
    });
    await waitFor(() =>
      expect(fetch).toHaveBeenLastCalledWith(
        "/lattice/tables/workbench.products?filter=updated_at%3Aeq%3A2026-06-01&page=1&per_page=25",
        requestOptions(),
      ),
    );

    const nameFilter = screen.getByRole("textbox", { name: "Filter Name" });
    fireEvent.change(nameFilter, { target: { value: "Lamp" } });
    fireEvent.keyDown(nameFilter, { key: "Enter" });
    await waitFor(() =>
      expect(fetch).toHaveBeenLastCalledWith(
        "/lattice/tables/workbench.products?filter=name%3Acontains%3ALamp&page=1&per_page=25",
        requestOptions(),
      ),
    );
  });
});

describe("per-page options", () => {
  function perPageNode(overrides: Partial<TableNode["props"]> = {}): TableNode {
    return {
      id: "workbench.users",
      props: {
        columns: [col({ key: "name", label: "Name", sortable: true })],
        data: [{ id: 1, name: "Taylor" }],
        endpoint: "/lattice/tables/workbench.users",
        perPageOptions: [25, 50, "infinite"],
        pagination: pagination({
          mode: "table",
          currentPage: 1,
          lastPage: 1,
          perPage: 25,
          total: 1,
        }),
        query: tableQuery(),
        ...overrides,
      },
      type: "table",
    } satisfies TableNode;
  }

  it("shows the select only when options are declared and changes the page size through it", async () => {
    const { unmount } = render(
      <TableComponent node={perPageNode({ perPageOptions: [] })}>{null}</TableComponent>,
    );

    expect(screen.queryByLabelText("Rows per page")).not.toBeInTheDocument();
    unmount();

    const fetch = tableFetch({
      data: [{ id: 2, name: "Ada" }],
      pagination: pagination({ mode: "table", currentPage: 1, lastPage: 1, perPage: 50, total: 1 }),
      query: tableQuery({ perPage: 50 }),
    });

    render(<TableComponent node={perPageNode()}>{null}</TableComponent>);

    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "50" } });

    await screen.findByRole("cell", { name: "Ada" });

    expect(fetch).toHaveBeenCalledWith(
      "/lattice/tables/workbench.users?page=1&per_page=50",
      requestOptions(),
    );
  });

  it("switches to infinite pagination, keeps it across reloads, and switches back", async () => {
    const fetch = tableFetch(
      {
        data: [{ id: 2, name: "Ada" }],
        pagination: pagination({
          mode: "infinite",
          currentPage: 1,
          perPage: 25,
          hasMore: true,
          nextPage: 2,
        }),
        query: tableQuery({ mode: "infinite" }),
      },
      {
        data: [{ id: 3, name: "Grace" }],
        pagination: pagination({
          mode: "infinite",
          currentPage: 1,
          perPage: 25,
          hasMore: true,
          nextPage: 2,
        }),
        query: tableQuery({ mode: "infinite", sorts: [{ key: "name", direction: "asc" }] }),
      },
      {
        data: [{ id: 4, name: "Maya" }],
        pagination: pagination({
          mode: "table",
          currentPage: 1,
          lastPage: 1,
          perPage: 25,
          total: 1,
        }),
        query: tableQuery(),
      },
    );

    render(<TableComponent node={perPageNode()}>{null}</TableComponent>);

    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "infinite" } });

    await screen.findByRole("cell", { name: "Ada" });

    expect(screen.queryByRole("cell", { name: "Taylor" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Load more" })).toBeVisible();
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "/lattice/tables/workbench.users?page=1&per_page=25&mode=infinite",
      requestOptions(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Sort Name" }));

    await screen.findByRole("cell", { name: "Grace" });

    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/lattice/tables/workbench.users?sort=name&page=1&per_page=25&mode=infinite",
      requestOptions(),
    );

    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "25" } });

    await screen.findByRole("cell", { name: "Maya" });

    expect(fetch).toHaveBeenNthCalledWith(
      3,
      "/lattice/tables/workbench.users?sort=name&page=1&per_page=25",
      requestOptions(),
    );
  });

  it("requests numbered pagination when a size is picked on an infinite table", async () => {
    const fetch = tableFetch({
      data: [{ id: 2, name: "Ada" }],
      pagination: pagination({ mode: "table", currentPage: 1, lastPage: 1, perPage: 25, total: 1 }),
      query: tableQuery(),
    });

    const node = perPageNode({
      pagination: pagination({
        mode: "infinite",
        currentPage: 1,
        perPage: 25,
        hasMore: false,
      }),
    });

    render(<TableComponent node={node}>{null}</TableComponent>);

    expect(screen.getByLabelText("Rows per page")).toHaveValue("infinite");

    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "25" } });

    await screen.findByRole("cell", { name: "Ada" });

    expect(fetch).toHaveBeenCalledWith(
      "/lattice/tables/workbench.users?page=1&per_page=25&mode=table",
      requestOptions(),
    );
  });
});
