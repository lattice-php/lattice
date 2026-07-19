import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@lattice-php/lattice/provider";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  TableNode,
  TablePagination,
  TableResult,
  TableQuery,
} from "@lattice-php/lattice/table/types";
import type { ColumnFilter } from "@lattice-php/lattice/types/generated";
import type { Node } from "@lattice-php/lattice/core/types";
import { fakeNode } from "@lattice-php/lattice/test-support";
import type { TableColumn } from "@lattice-php/lattice/table/types";
import TableComponent from "./table";

function col(partial: {
  key: string;
  label: string;
  type?: string;
  width?: TableColumn["props"]["width"];
  sortable?: boolean;
  filter?: ColumnFilter | null;
  schema?: Node[];
  props?: Record<string, unknown>;
}): TableColumn {
  const { key, label, type = "column.text", width, sortable, filter, schema, props } = partial;

  return {
    key,
    type,
    props: {
      label,
      width: width ?? (type === "column.stack" ? "xl" : "md"),
      align: "start",
      sortable: sortable ?? null,
      toggleable: false,
      hiddenByDefault: false,
      filter: filter ?? null,
      ...props,
    },
    ...(schema ? { schema } : {}),
  } as TableColumn;
}

function pagination(overrides: Partial<TablePagination> = {}): TablePagination {
  return {
    mode: "none",
    currentPage: null,
    lastPage: null,
    perPage: null,
    total: null,
    from: null,
    to: null,
    hasMore: false,
    nextPage: null,
    ...overrides,
  };
}

function tableQuery(overrides: Partial<TableQuery> = {}): Partial<TableQuery> {
  return {
    filters: [],
    page: 1,
    perPage: 25,
    sorts: [],
    ...overrides,
  };
}

type TableResultOverrides = Partial<Omit<TableResult, "query">> & { query?: Partial<TableQuery> };

function tableResponse(overrides: TableResultOverrides = {}): Response {
  return Response.json({
    data: [],
    pagination: {},
    ...overrides,
    query: tableQuery(overrides.query),
  });
}

function tableFetch(...responses: TableResultOverrides[]) {
  let calls = 0;
  const fetch = vi.fn<typeof globalThis.fetch>(async () => {
    const response = responses[Math.min(calls, responses.length - 1)] ?? {};
    calls += 1;

    return tableResponse(response);
  });

  vi.stubGlobal("fetch", fetch);

  return fetch;
}

function requestOptions(headers: Record<string, string> = {}) {
  return {
    credentials: "same-origin",
    method: undefined,
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
      ...headers,
    },
  };
}

describe("Lattice table component", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders columns and rows from server props", () => {
    const node = {
      id: "workbench.users",
      props: {
        columns: [
          col({
            key: "name",
            label: "Name",
            sortable: true,
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
            key: "status",
            label: "Status",
          }),
          col({
            key: "created_at",
            label: "Created",
            props: {
              date: {
                dateStyle: "medium",
                timeStyle: "short",
              },
            },
          }),
          col({
            key: "email",
            label: "Email",
            sortable: true,
            props: {
              copyable: true,
              link: {
                href: "mailto:{value}",
                external: false,
              },
            },
          }),
        ],
        data: [
          {
            name: "Taylor",
            status: "Active",
            created_at: "2025-01-01 09:15:00",
            email: "taylor@example.com",
          },
        ],
        endpoint: "/lattice/tables/workbench.users",
        query: {
          filters: [],
          page: 1,
          perPage: 25,
          sorts: [
            { key: "name", direction: "asc" },
            { key: "email", direction: "desc" },
          ],
        },
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    expect(screen.getByRole("button", { name: "Sort Name" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Sort Name" }).closest('[role="columnheader"]'),
    ).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getByText("1. Name")).toBeVisible();
    expect(screen.getByText("2. Email")).toBeVisible();
    expect(screen.getByRole("img", { name: "ascending" })).toBeVisible();
    expect(screen.getByRole("img", { name: "descending" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Clear Name sort" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Filter Name" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Status" })).toHaveClass("px-4", "py-3");

    expect(screen.getByRole("cell", { name: "Taylor" })).toBeVisible();
    expect(screen.getByRole("cell", { name: "Active" })).toBeVisible();
    const createdCell = screen.getByRole("cell", { name: /2025/ });
    expect(createdCell).toBeVisible();
    expect(createdCell.querySelector("time")).not.toBeNull();
    expect(screen.getByRole("link", { name: "taylor@example.com" })).toHaveAttribute(
      "href",
      "mailto:taylor%40example.com",
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy Email" }));

    expect(screen.getByRole("button", { name: "Copied Email" })).toBeVisible();
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
        query: {
          filters: [],
          page: 1,
          perPage: 25,
          sorts: [],
        },
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

  it("uses column width hints when building the table grid", () => {
    const node = {
      id: "workbench.products",
      props: {
        columns: [
          col({
            key: "qty",
            label: "Qty",
            width: "sm",
          }),
          col({
            key: "description",
            label: "Description",
            width: "xl",
          }),
        ],
        data: [],
        query: {
          filters: [],
          page: 1,
          perPage: 25,
          sorts: [],
        },
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    expect(screen.getByRole("columnheader", { name: "Qty" }).parentElement).toHaveStyle(
      "--lattice-table-columns: minmax(6rem, 0.5fr) minmax(16rem, 2fr)",
    );
  });

  it("clips overflowing body cell content to the column boundary", () => {
    const longToken = "sku-" + "x".repeat(120);
    const node = {
      id: "workbench.products",
      props: {
        columns: [
          col({
            key: "sku",
            label: "SKU",
            width: "sm",
          }),
        ],
        data: [{ sku: longToken }],
        query: {
          filters: [],
          page: 1,
          perPage: 25,
          sorts: [],
        },
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    const cell = screen.getByRole("cell", { name: longToken });
    const content = cell.querySelector('[data-slot="table-cell-content"]');

    expect(cell).toHaveClass("min-w-0", "overflow-hidden");
    expect(content).toHaveClass("min-w-0", "max-w-full", "overflow-hidden", "truncate");
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
        query: {
          filters: [],
          page: 1,
          perPage: 25,
          sorts: [],
        },
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

  it("stores resized column widths under the table identity", () => {
    const node = {
      id: "workbench.products",
      props: {
        columns: [
          col({
            key: "qty",
            label: "Qty",
          }),
          col({
            key: "price",
            label: "Price",
          }),
        ],
        data: [],
        resizableColumns: true,
        query: {
          filters: [],
          page: 1,
          perPage: 25,
          sorts: [],
        },
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    const handle = screen.getByRole("separator", { name: "Resize Qty" });

    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 180, pointerId: 1 });

    expect(window.localStorage.getItem("lattice:table-columns:workbench.products")).toBeNull();

    fireEvent.pointerUp(handle, { clientX: 180, pointerId: 1 });

    expect(
      JSON.parse(window.localStorage.getItem("lattice:table-columns:workbench.products") ?? ""),
    ).toEqual({
      columns: ["qty", "price"],
      overrides: {
        qty: 256,
      },
    });
  });

  it("keeps resized table column styles on the table root instead of every row", () => {
    const node = {
      id: "workbench.products",
      props: {
        columns: [
          col({
            key: "qty",
            label: "Qty",
          }),
          col({
            key: "price",
            label: "Price",
          }),
        ],
        data: [{ id: 1, qty: 1, price: "$10" }],
        resizableColumns: true,
        query: {
          filters: [],
          page: 1,
          perPage: 25,
          sorts: [],
        },
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    const row = screen.getByRole("cell", { name: "1" }).closest('[data-slot="table-row"]');
    const table = row?.parentElement?.parentElement;

    expect(table).toHaveStyle("--lattice-table-columns: minmax(8rem, 1fr) minmax(8rem, 1fr)");
    expect(row?.getAttribute("style") ?? "").not.toContain("--lattice-table-columns");
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
            schema: [
              fakeNode({ type: "text", props: { dataBindings: { text: "name" } } }),
              fakeNode({ type: "text", props: { dataBindings: { text: "email" } } }),
            ],
          }),
          col({
            key: "status",
            label: "Status",
            type: "column.text",
          }),
        ],
        data: [
          {
            id: 1,
            name: "Ada",
            email: "ada@example.com",
            status: "Owner",
          },
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
        query: {
          filters: [],
          page: 1,
          perPage: 25,
          sorts: [],
        },
      },
      type: "table",
    } satisfies TableNode;

    const { container } = render(<TableComponent node={node}>{null}</TableComponent>);

    expect(container.querySelector("td")).not.toBeInTheDocument();
    expect(screen.getByRole("table")).toBeVisible();
    expect(screen.getByRole("cell", { name: /Ada/ })).toHaveTextContent("ada@example.com");
    expect(screen.getByRole("cell", { name: /Taylor/ })).toHaveTextContent("taylor@example.com");
    expect(screen.getByRole("cell", { name: "Active" })).toBeVisible();
    expect(await screen.findByRole("button", { name: "Manage user" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Manage user" }));

    const action = await screen.findByRole("button", { name: "Ping" });
    const link = screen.getByRole("link", { name: "Edit" });

    expect(action).toBeVisible();
    expect(action).toHaveClass("h-lt-control-sm", "font-normal", "text-lt-popover-fg");
    expect(action).not.toHaveClass("bg-lt-secondary");
    expect(link).toHaveAttribute("href", "/products/2/edit");
    expect(link).toHaveClass(
      "h-lt-control-sm",
      "font-normal",
      "text-lt-popover-fg",
      "no-underline",
    );
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
        query: {
          filters: [],
          page: 1,
          perPage: 25,
          sorts: [],
        },
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

  it("stripes rows when the table is striped", () => {
    const node = {
      id: "workbench.products",
      props: {
        columns: [col({ key: "name", label: "Name" })],
        data: [{ name: "Taylor" }],
        striped: true,
        query: tableQuery(),
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    expect(screen.getByRole("cell", { name: "Taylor" }).closest('[role="row"]')).toHaveClass(
      "odd:bg-lt-muted/30",
    );
  });

  it("adds a clause with a chosen operator from the column filter popover", async () => {
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
        ],
        data: [],
        endpoint: "/lattice/tables/workbench.products",
        query: tableQuery(),
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Name filters" }));

    fireEvent.change(screen.getByRole("combobox", { name: "Name operator" }), {
      target: { value: "neq" },
    });

    const valueInput = screen.getByRole("textbox", { name: "Name filter value" });
    fireEvent.change(valueInput, { target: { value: "bar" } });
    fireEvent.keyDown(valueInput, { key: "Enter" });

    await waitFor(() =>
      expect(fetch).toHaveBeenLastCalledWith(
        "/lattice/tables/workbench.products?filter=name%3Aneq%3Abar&page=1&per_page=25",
        requestOptions(),
      ),
    );
  });
});
