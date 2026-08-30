import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { col, tableFetch, tableNode, tableQuery } from "../test-support";
import { useTable } from "./use-table";

describe("useTable URL sync", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/products");
  });

  it("mounts with state purely from props, never reading a pre-existing url param", () => {
    window.history.replaceState({}, "", "/products?q=leftover&page=3");

    const node = tableNode({
      defaultPerPage: 25,
      query: tableQuery({ search: "from-server" }),
      queryKey: null,
      syncQuery: true,
    });

    const { result } = renderHook(() => useTable(node));

    expect(result.current.search).toBe("from-server");
  });

  it("does not touch the url when syncQuery is off", async () => {
    tableFetch({ query: tableQuery({ search: "acme" }) });

    const node = tableNode({ defaultPerPage: 25, queryKey: null, syncQuery: false });
    const { result } = renderHook(() => useTable(node));

    await act(async () => {
      result.current.setSearch("acme");
    });

    await waitFor(() => expect(result.current.search).toBe("acme"));
    expect(window.location.search).toBe("");
  });

  it("writes a search change onto the url", async () => {
    tableFetch({ query: tableQuery({ search: "acme" }) });

    const node = tableNode({ defaultPerPage: 25, queryKey: null, syncQuery: true });
    const { result } = renderHook(() => useTable(node));

    await act(async () => {
      result.current.setSearch("acme");
    });

    await waitFor(() => expect(window.location.search).toBe("?q=acme"));
  });

  it("writes a sort change onto the url", async () => {
    const columns = [col({ key: "name", label: "Name", sortable: true })];
    tableFetch({ query: tableQuery({ sorts: [{ direction: "asc", key: "name" }] }) });

    const node = tableNode({ columns, defaultPerPage: 25, queryKey: null, syncQuery: true });
    const { result } = renderHook(() => useTable(node));

    await act(async () => {
      result.current.sort(result.current.columns[0]);
    });

    await waitFor(() => expect(window.location.search).toBe("?sort=name"));
  });

  it("writes a page change onto the url, omitting the implicit first page", async () => {
    tableFetch({ query: tableQuery({ page: 2 }) });

    const node = tableNode({ defaultPerPage: 25, queryKey: null, syncQuery: true });
    const { result } = renderHook(() => useTable(node));

    await act(async () => {
      result.current.goToPage(2);
    });

    await waitFor(() => expect(window.location.search).toBe("?page=2"));
  });

  it("writes a per_page change onto the url only when it differs from the default", async () => {
    tableFetch({ query: tableQuery({ perPage: 50 }) });

    const node = tableNode({ defaultPerPage: 25, queryKey: null, syncQuery: true });
    const { result } = renderHook(() => useTable(node));

    await act(async () => {
      result.current.setPerPage(50);
    });

    await waitFor(() => expect(window.location.search).toBe("?per_page=50"));
  });

  it("resetFilters clears only the owned params, leaving a foreign one untouched", async () => {
    window.history.replaceState({}, "", "/products?tabs=details&q=old&filter=name:eq:x");
    tableFetch({ query: tableQuery() });

    const node = tableNode({ defaultPerPage: 25, queryKey: null, syncQuery: true });
    const { result } = renderHook(() => useTable(node));

    await act(async () => {
      result.current.resetFilters();
    });

    await waitFor(() => expect(window.location.search).toBe("?tabs=details"));
  });

  it("nests the write under the definition's urlQueryKey when one is set", async () => {
    tableFetch({ query: tableQuery({ search: "acme" }) });

    const node = tableNode({ defaultPerPage: 25, queryKey: "products", syncQuery: true });
    const { result } = renderHook(() => useTable(node));

    await act(async () => {
      result.current.setSearch("acme");
    });

    await waitFor(() => expect(window.location.search).toBe("?products%5Bq%5D=acme"));
  });
});
