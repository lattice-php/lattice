import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import "@lattice-php/lattice/provider";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TableNode } from "@lattice-php/table/types";
import { fakeNode } from "@lattice-php/core/test-support";
import { ActionInteractionProvider } from "@lattice-php/action";
import { defaultNavigation, NavigationProvider } from "@lattice-php/ui/navigation";
import { col, pagination, requestOptions, rowClick, tableFetch, tableQuery } from "../test-support";
import { TableComponent } from "./table";

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

describe("column pinning", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("orders a server-pinned column first and marks it and utility cells as pinned", () => {
    const node = {
      id: "workbench.pinned-server",
      props: {
        columns: [
          col({ key: "a", label: "A" }),
          col({ key: "b", label: "B", pinned: "start" }),
          col({ key: "c", label: "C" }),
        ],
        data: [
          {
            id: 1,
            a: "A1",
            b: "B1",
            c: "C1",
            actions: [{ type: "link", props: { href: "/edit/1", label: "Edit" } }],
          },
        ],
        query: tableQuery(),
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    const headers = screen.getAllByRole("columnheader");

    expect(headers.map((header) => header.textContent)).toEqual(["B", "A", "C", "Actions"]);
    expect(headers[0]).toHaveAttribute("data-pinned", "start");
    expect(headers[1]).not.toHaveAttribute("data-pinned");
    expect(headers[2]).not.toHaveAttribute("data-pinned");
    expect(headers[3]).toHaveAttribute("data-pinned", "end");

    const rows = screen.getAllByRole("row");
    const bodyRow = rows[rows.length - 1]!;
    const cells = within(bodyRow).getAllByRole("cell");

    expect(
      cells.map((cell) => cell.querySelector('[data-slot="table-cell-content"]')?.textContent),
    ).toEqual(["B1", "A1", "C1", undefined]);
    expect(cells[0]).toHaveAttribute("data-pinned", "start");
    expect(cells[1]).not.toHaveAttribute("data-pinned");
    expect(cells[2]).not.toHaveAttribute("data-pinned");
    expect(cells[3]).toHaveAttribute("data-pinned", "end");
  });

  it("pins and unpins a column through the columns menu, persisting the override", () => {
    const node = {
      id: "workbench.pinned-menu",
      props: {
        columns: [
          col({ key: "a", label: "A" }),
          col({ key: "b", label: "B" }),
          col({ key: "c", label: "C" }),
        ],
        data: [],
        pinnableColumns: true,
        query: tableQuery(),
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    fireEvent.click(screen.getByTestId("table-columns-menu"));
    fireEvent.click(screen.getByTestId("table-column-pin-right-b"));

    expect(screen.getAllByRole("columnheader").map((header) => header.textContent)).toEqual([
      "A",
      "C",
      "B",
    ]);
    expect(
      JSON.parse(window.localStorage.getItem("lattice:table-pins:workbench.pinned-menu") ?? ""),
    ).toEqual({ overrides: { b: "end" } });
    expect(screen.getByTestId("table-column-pin-right-b")).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByTestId("table-column-pin-right-b"));

    expect(screen.getAllByRole("columnheader").map((header) => header.textContent)).toEqual([
      "A",
      "B",
      "C",
    ]);
    expect(window.localStorage.getItem("lattice:table-pins:workbench.pinned-menu")).toBeNull();
  });

  it("explicitly unpins a server default and restores it via reset", () => {
    const node = {
      id: "workbench.pinned-reset",
      props: {
        columns: [
          col({ key: "a", label: "A" }),
          col({ key: "b", label: "B", pinned: "start" }),
          col({ key: "c", label: "C" }),
        ],
        data: [],
        pinnableColumns: true,
        query: tableQuery(),
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    expect(screen.getAllByRole("columnheader").map((header) => header.textContent)).toEqual([
      "B",
      "A",
      "C",
    ]);

    fireEvent.click(screen.getByTestId("table-columns-menu"));
    fireEvent.click(screen.getByTestId("table-column-pin-left-b"));

    expect(screen.getAllByRole("columnheader").map((header) => header.textContent)).toEqual([
      "A",
      "B",
      "C",
    ]);
    expect(
      JSON.parse(window.localStorage.getItem("lattice:table-pins:workbench.pinned-reset") ?? ""),
    ).toEqual({ overrides: { b: false } });

    fireEvent.click(screen.getByTestId("table-columns-reset"));

    expect(screen.getAllByRole("columnheader").map((header) => header.textContent)).toEqual([
      "B",
      "A",
      "C",
    ]);
    expect(window.localStorage.getItem("lattice:table-pins:workbench.pinned-reset")).toBeNull();
  });

  it("renders no pinned markup and keeps the natural column order when nothing is pinned", () => {
    const node = {
      id: "workbench.unpinned",
      props: {
        columns: [col({ key: "a", label: "A" }), col({ key: "b", label: "B" })],
        data: [{ id: 1, a: "A1", b: "B1" }],
        query: tableQuery(),
      },
      type: "table",
    } satisfies TableNode;

    const { container } = render(<TableComponent node={node}>{null}</TableComponent>);

    expect(container.querySelector("[data-pinned]")).not.toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveClass("min-w-full");
    expect(screen.getByRole("table")).not.toHaveClass("min-w-max");
  });

  it("marks the boundary edges of the pinned groups with data-pin-boundary", () => {
    const node = {
      id: "workbench.pinned-boundary",
      props: {
        columns: [
          col({ key: "a", label: "A" }),
          col({ key: "b", label: "B", pinned: "start" }),
          col({ key: "c", label: "C" }),
          col({ key: "d", label: "D", pinned: "end" }),
        ],
        data: [
          {
            id: 1,
            a: "A1",
            b: "B1",
            c: "C1",
            d: "D1",
            actions: [{ type: "link", props: { href: "/edit/1", label: "Edit" } }],
          },
        ],
        query: tableQuery(),
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    const headers = screen.getAllByRole("columnheader");

    expect(headers.map((header) => header.textContent)).toEqual(["B", "A", "C", "D", "Actions"]);
    expect(headers[0]).toHaveAttribute("data-pin-boundary", "end");
    expect(headers[1]).not.toHaveAttribute("data-pin-boundary");
    expect(headers[2]).not.toHaveAttribute("data-pin-boundary");
    expect(headers[3]).toHaveAttribute("data-pin-boundary", "start");
    expect(headers[4]).not.toHaveAttribute("data-pin-boundary");

    const rows = screen.getAllByRole("row");
    const bodyRow = rows[rows.length - 1]!;
    const cells = within(bodyRow).getAllByRole("cell");

    expect(cells[0]).toHaveAttribute("data-pin-boundary", "end");
    expect(cells[1]).not.toHaveAttribute("data-pin-boundary");
    expect(cells[2]).not.toHaveAttribute("data-pin-boundary");
    expect(cells[3]).toHaveAttribute("data-pin-boundary", "start");
    expect(cells[4]).not.toHaveAttribute("data-pin-boundary");
  });

  it("lets the selection cell own the left boundary when no column is left-pinned", () => {
    const node = {
      id: "workbench.pinned-boundary-selection",
      props: {
        bulkActions: [
          fakeNode({
            type: "action",
            id: "workbench.archive-selected",
            props: {
              label: "Archive selected",
              method: "patch",
              endpoint: "/lattice/bulk-actions/workbench.archive-selected",
              ref: "sealed-ref",
            },
          }),
        ],
        columns: [col({ key: "a", label: "A" }), col({ key: "b", label: "B", pinned: "end" })],
        data: [{ id: 1, a: "A1", b: "B1" }],
        query: tableQuery(),
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    const headers = screen.getAllByRole("columnheader");
    const selectionHeader = headers[0]!;

    expect(selectionHeader).toHaveAttribute("data-pinned", "start");
    expect(selectionHeader).toHaveAttribute("data-pin-boundary", "end");

    const rows = screen.getAllByRole("row");
    const bodyRow = rows[rows.length - 1]!;
    const selectionCell = within(bodyRow).getAllByRole("cell")[0]!;

    expect(selectionCell).toHaveAttribute("data-pinned", "start");
    expect(selectionCell).toHaveAttribute("data-pin-boundary", "end");
  });
});

describe("row clicks", () => {
  const visit = vi.fn();

  afterEach(() => {
    visit.mockClear();
  });

  function renderLinkedTable(overrides: Partial<TableNode["props"]> = {}) {
    const node = {
      id: "workbench.row-links",
      props: {
        columns: [col({ key: "name", label: "Name" })],
        data: [{ id: 1, name: "Lamp" }],
        query: tableQuery(),
        ...overrides,
      },
      type: "table",
    } satisfies TableNode;

    return render(
      <ActionInteractionProvider>
        <NavigationProvider adapter={{ ...defaultNavigation, visit }}>
          <TableComponent node={node}>{null}</TableComponent>
        </NavigationProvider>
      </ActionInteractionProvider>,
    );
  }

  it("marks a row carrying a url and visits it when a plain cell is clicked", () => {
    renderLinkedTable({
      data: [{ id: 1, name: "Lamp", rowClick: rowClick({ href: "/products/1" }) }],
    });

    const row = screen.getByRole("cell", { name: "Lamp" }).closest('[data-slot="table-row"]');

    expect(row).toHaveAttribute("data-row-link", "/products/1");

    fireEvent.click(screen.getByRole("cell", { name: "Lamp" }));

    expect(visit).toHaveBeenCalledWith("/products/1");
  });

  it("visits a linked row when it is activated from the keyboard", () => {
    renderLinkedTable({
      data: [{ id: 1, name: "Lamp", rowClick: rowClick({ href: "/products/1" }) }],
    });

    const row = screen.getByRole("cell", { name: "Lamp" }).closest('[data-slot="table-row"]')!;

    fireEvent.keyDown(row, { key: "Enter" });

    expect(visit).toHaveBeenCalledWith("/products/1");
  });

  it("does not navigate when clicking a row action link inside a linked row", () => {
    renderLinkedTable({
      data: [
        {
          id: 1,
          name: "Lamp",
          rowClick: rowClick({ href: "/products/1" }),
          actions: [{ type: "link", props: { href: "/edit/1", label: "Edit" } }],
        },
      ],
    });

    fireEvent.click(screen.getByRole("link", { name: "Edit" }));

    expect(visit).not.toHaveBeenCalled();
  });

  it("does not navigate when clicking a row's selection checkbox inside a linked row", () => {
    renderLinkedTable({
      bulkActions: [
        fakeNode({
          type: "action",
          id: "workbench.archive-selected",
          props: {
            label: "Archive selected",
            method: "patch",
            endpoint: "/lattice/bulk-actions/workbench.archive-selected",
            ref: "sealed-ref",
          },
        }),
      ],
      data: [{ id: 1, name: "Lamp", rowClick: rowClick({ href: "/products/1" }) }],
    });

    fireEvent.click(screen.getByTestId("select-row-1"));

    expect(visit).not.toHaveBeenCalled();
  });

  it("renders no row-link markup for a row without a click behavior", () => {
    renderLinkedTable();

    const row = screen.getByRole("cell", { name: "Lamp" }).closest('[data-slot="table-row"]');

    expect(row).not.toHaveAttribute("data-row-link");

    fireEvent.click(screen.getByRole("cell", { name: "Lamp" }));

    expect(visit).not.toHaveBeenCalled();
  });
});
