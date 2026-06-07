import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LatticeNode } from "@/lattice/core/types";
import TableComponent from "./table";

describe("Lattice table component", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders columns and rows from server props", () => {
    const node = {
      id: "workbench.users",
      props: {
        columns: [
          {
            key: "name",
            label: "Name",
            sortable: true,
            filter: {
              enabled: true,
              type: "partial",
            },
          },
          {
            key: "status",
            label: "Status",
          },
          {
            key: "created_at",
            label: "Created",
            date: {
              format: "Y-m-d H:i",
            },
          },
          {
            key: "email",
            label: "Email",
            sortable: true,
            copyable: true,
            link: {
              href: "mailto:{value}",
              external: false,
            },
          },
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
          filters: {},
          page: 1,
          perPage: 25,
          sorts: [
            { key: "name", direction: "asc" },
            { key: "email", direction: "desc" },
          ],
        },
      },
      type: "table",
    } satisfies LatticeNode<"table">;

    render(<TableComponent node={node}>{null}</TableComponent>);

    expect(screen.getByRole("button", { name: "Sort Name" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Sort Name" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    expect(screen.getByText("Sorted by")).toBeVisible();
    expect(screen.getByText("1. Name ascending")).toBeVisible();
    expect(screen.getByText("2. Email descending")).toBeVisible();
    expect(screen.getByRole("button", { name: "Clear Name sort" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Filter Name" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Apply filters" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeVisible();

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

  it("adds and clears individual sorts through the table endpoint", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      Response.json({
        data: [],
        pagination: {},
        state: {
          filters: {},
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
          {
            key: "name",
            label: "Name",
            sortable: true,
          },
          {
            key: "email",
            label: "Email",
            sortable: true,
          },
        ],
        data: [],
        endpoint: "/lattice/tables/workbench.users",
        state: {
          filters: {},
          page: 1,
          perPage: 25,
          sorts: [{ key: "name", direction: "asc" }],
        },
      },
      type: "table",
    } satisfies LatticeNode<"table">;

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

    await screen.findByText("2. Email ascending");

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
});
