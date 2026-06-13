import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TableNode, TablePagination } from "../types";
import type { ColumnData } from "@lattice-php/lattice/types/generated";
import TableComponent from "./table";

function col(partial: Partial<ColumnData> & Pick<ColumnData, "key" | "label">): ColumnData {
  const type = partial.type ?? "text";

  return {
    type,
    width: type === "stack" ? "xl" : "md",
    sortable: null,
    filter: null,
    columns: null,
    props: null,
    ...partial,
  };
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

describe("Lattice table component", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
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
              enabled: true,
              type: "text",
              operators: ["contains", "eq", "neq"],
              defaultOperator: "contains",
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
                format: "Y-m-d H:i",
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
        state: {
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
    expect(screen.getByRole("cell", { name: "2025-01-01 09:15" })).toBeVisible();
    expect(screen.getByRole("link", { name: "taylor@example.com" })).toHaveAttribute(
      "href",
      "mailto:taylor%40example.com",
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy Email" }));

    expect(screen.getByRole("button", { name: "Copied Email" })).toBeVisible();
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
        state: {
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
        state: {
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

  it("renders grid rows with stack columns and row actions without table cells", async () => {
    const node = {
      id: "workbench.stacked-users",
      props: {
        columns: [
          col({
            key: "identity",
            label: "Identity",
            type: "stack",
            columns: [
              col({
                key: "name",
                label: "Name",
                type: "text",
                sortable: true,
              }),
              col({
                key: "email",
                label: "Email",
                type: "text",
              }),
            ],
          }),
          col({
            key: "status",
            label: "Status",
            type: "text",
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
        state: {
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

    expect(await screen.findByRole("button", { name: "Ping" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute("href", "/products/2/edit");
  });

  it("adds and clears individual sorts through the table endpoint", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      Response.json({
        data: [],
        pagination: {},
        state: {
          filters: [],
          page: 1,
          perPage: 25,
          sorts: [
            { key: "name", direction: "asc" },
            { key: "email", direction: "asc" },
          ],
        },
      }),
    );

    vi.stubGlobal("fetch", fetch);

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
        state: {
          filters: [],
          page: 1,
          perPage: 25,
          sorts: [{ key: "name", direction: "asc" }],
        },
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Sort Email" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/lattice/tables/workbench.users?sort=name%2Cemail&page=1&per_page=25",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
    });

    await screen.findByText("2. Email");

    fireEvent.click(screen.getByRole("button", { name: "Clear Email sort" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith(
        "/lattice/tables/workbench.users?sort=name&page=1&per_page=25",
        {
          headers: {
            Accept: "application/json",
          },
        },
      );
    });
  });

  it("sends component refs with table state requests", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      Response.json({
        data: [],
        pagination: {},
        state: {
          filters: [],
          page: 1,
          perPage: 25,
          sorts: [{ key: "name", direction: "asc" }],
        },
      }),
    );

    vi.stubGlobal("fetch", fetch);

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
        state: {
          filters: [],
          page: 1,
          perPage: 25,
          sorts: [],
        },
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Sort Name" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/lattice/tables/teams.members?sort=name&page=1&per_page=25",
        {
          headers: {
            Accept: "application/json",
            "X-Lattice-Ref": "sealed-reference",
          },
        },
      );
    });
  });

  it("reloads itself when a matching reload component event is dispatched", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      Response.json({
        data: [{ id: 2, name: "Ada" }],
        pagination: {
          mode: "none",
        },
        state: {
          filters: [],
          page: 1,
          perPage: 25,
          sorts: [],
        },
      }),
    );

    vi.stubGlobal("fetch", fetch);

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
        state: {
          filters: [],
          page: 1,
          perPage: 25,
          sorts: [],
        },
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    window.dispatchEvent(
      new CustomEvent("lattice:reload-component", {
        detail: {
          component: "settings.passkeys",
          type: "reloadComponent",
        },
      }),
    );

    await screen.findByRole("cell", { name: "Ada" });

    expect(fetch).toHaveBeenCalledWith("/lattice/tables/settings.passkeys?page=1&per_page=25", {
      headers: {
        Accept: "application/json",
      },
    });
    expect(screen.queryByRole("cell", { name: "Taylor" })).not.toBeInTheDocument();
  });

  it("appends infinite table rows and resets them when sorting", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(
        Response.json({
          data: [{ id: 2, name: "Ada" }],
          pagination: {
            currentPage: 2,
            hasMore: false,
            mode: "infinite",
            nextPage: null,
            perPage: 1,
          },
          state: {
            filters: [],
            page: 2,
            perPage: 1,
            sorts: [],
          },
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          data: [{ id: 3, name: "Grace" }],
          pagination: {
            currentPage: 1,
            hasMore: false,
            mode: "infinite",
            nextPage: null,
            perPage: 1,
          },
          state: {
            filters: [],
            page: 1,
            perPage: 1,
            sorts: [{ key: "name", direction: "asc" }],
          },
        }),
      );

    vi.stubGlobal("fetch", fetch);

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
        state: {
          filters: [],
          page: 1,
          perPage: 1,
          sorts: [],
        },
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));

    await screen.findByRole("cell", { name: "Ada" });

    expect(screen.getByRole("cell", { name: "Taylor" })).toBeVisible();
    expect(fetch).toHaveBeenNthCalledWith(1, "/lattice/tables/workbench.users?page=2&per_page=1", {
      headers: {
        Accept: "application/json",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sort Name" }));

    await screen.findByRole("cell", { name: "Grace" });

    expect(screen.queryByRole("cell", { name: "Taylor" })).not.toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "Ada" })).not.toBeInTheDocument();
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/lattice/tables/workbench.users?sort=name&page=1&per_page=1",
      {
        headers: {
          Accept: "application/json",
        },
      },
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
        state: {
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
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      Response.json({
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
        state: {
          filters: [],
          page: 3,
          perPage: 1,
          sorts: [],
        },
      }),
    );

    vi.stubGlobal("fetch", fetch);

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
        state: {
          filters: [],
          page: 2,
          perPage: 1,
          sorts: [],
        },
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Showing 2-2 of 4")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));

    await screen.findByRole("cell", { name: "Grace" });

    expect(fetch).toHaveBeenCalledWith("/lattice/tables/workbench.users?page=3&per_page=1", {
      headers: {
        Accept: "application/json",
      },
    });
  });

  it("loads lazy table data after the component mounts", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      Response.json({
        data: [{ id: 1, name: "Ada" }],
        pagination: {
          currentPage: 1,
          hasMore: false,
          mode: "none",
          total: 1,
          from: 1,
          to: 1,
        },
        state: {
          filters: [],
          page: 1,
          perPage: 25,
          sorts: [],
        },
      }),
    );

    vi.stubGlobal("fetch", fetch);

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
        state: {
          filters: [],
          page: 1,
          perPage: 25,
          sorts: [],
        },
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    expect(screen.getByText("Loading rows...")).toBeVisible();

    await screen.findByRole("cell", { name: "Ada" });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/lattice/tables/workbench.users.none?page=1&per_page=25", {
      headers: {
        Accept: "application/json",
      },
    });
    expect(screen.getByText("Showing 1-1 of 1")).toBeVisible();
  });

  it("applies per-column header filters by type", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      Response.json({
        data: [],
        pagination: {},
        state: { filters: [], page: 1, perPage: 25, sorts: [] },
      }),
    );

    vi.stubGlobal("fetch", fetch);

    const node = {
      id: "workbench.products",
      props: {
        columns: [
          col({
            key: "name",
            label: "Name",
            filter: {
              enabled: true,
              type: "text",
              operators: ["contains", "eq", "neq"],
              defaultOperator: "contains",
            },
          }),
          col({
            key: "featured",
            label: "Featured",
            filter: {
              enabled: true,
              type: "boolean",
              operators: ["eq"],
              defaultOperator: "eq",
            },
          }),
          col({
            key: "updated_at",
            label: "Updated",
            filter: {
              enabled: true,
              type: "date",
              operators: ["eq", "before", "after"],
              defaultOperator: "eq",
            },
          }),
        ],
        data: [],
        endpoint: "/lattice/tables/workbench.products",
        state: { filters: [], page: 1, perPage: 25, sorts: [] },
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
        { headers: { Accept: "application/json" } },
      ),
    );

    fireEvent.change(screen.getByLabelText("Filter Updated"), {
      target: { value: "2026-06-01" },
    });
    await waitFor(() =>
      expect(fetch).toHaveBeenLastCalledWith(
        "/lattice/tables/workbench.products?filter=updated_at%3Aeq%3A2026-06-01&page=1&per_page=25",
        { headers: { Accept: "application/json" } },
      ),
    );

    const nameFilter = screen.getByRole("textbox", { name: "Filter Name" });
    fireEvent.change(nameFilter, { target: { value: "Lamp" } });
    fireEvent.keyDown(nameFilter, { key: "Enter" });
    await waitFor(() =>
      expect(fetch).toHaveBeenLastCalledWith(
        "/lattice/tables/workbench.products?filter=name%3Acontains%3ALamp&page=1&per_page=25",
        { headers: { Accept: "application/json" } },
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
        state: { filters: [], page: 1, perPage: 25, sorts: [] },
      },
      type: "table",
    } satisfies TableNode;

    render(<TableComponent node={node}>{null}</TableComponent>);

    expect(screen.getByRole("cell", { name: "Taylor" }).closest('[role="row"]')).toHaveClass(
      "odd:bg-lt-muted/30",
    );
  });

  it("adds a clause with a chosen operator from the column filter popover", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      Response.json({
        data: [],
        pagination: {},
        state: { filters: [], page: 1, perPage: 25, sorts: [] },
      }),
    );

    vi.stubGlobal("fetch", fetch);

    const node = {
      id: "workbench.products",
      props: {
        columns: [
          col({
            key: "name",
            label: "Name",
            filter: {
              enabled: true,
              type: "text",
              operators: ["contains", "eq", "neq"],
              defaultOperator: "contains",
            },
          }),
        ],
        data: [],
        endpoint: "/lattice/tables/workbench.products",
        state: { filters: [], page: 1, perPage: 25, sorts: [] },
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
        { headers: { Accept: "application/json" } },
      ),
    );
  });
});
