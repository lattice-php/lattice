import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { registry } from "@lattice-php/lattice/registry";
import { renderWithRegistry } from "@lattice-php/core/test-support";
import type { TableNode } from "@lattice-php/table/types";
import { col, tableFetch, tableNode, tableQuery } from "../test-support";
import { TableComponent } from "./table";

function node(searchable: boolean): TableNode {
  return tableNode({
    columns: [col({ key: "name", label: "Name" })],
    searchable,
    query: tableQuery({ search: "" }),
  });
}

describe("global table search", () => {
  it("issues a debounced q request as the user types", async () => {
    const fetch = tableFetch({ query: { search: "acme" } });

    renderWithRegistry(<TableComponent node={node(true)} />, registry);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "acme" } });

    await waitFor(() => {
      expect(fetch.mock.calls.some((call) => String(call[0]).includes("q=acme"))).toBe(true);
    });
  });

  it("clears the term through the clear button", async () => {
    const fetch = tableFetch({ query: { search: "acme" } }, { query: { search: "" } });

    renderWithRegistry(<TableComponent node={node(true)} />, registry);

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "acme" } });

    await waitFor(() => {
      expect(fetch.mock.calls.some((call) => String(call[0]).includes("q=acme"))).toBe(true);
    });

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    await waitFor(() => {
      expect(String(fetch.mock.calls.at(-1)?.[0])).not.toContain("q=acme");
    });
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });
});
