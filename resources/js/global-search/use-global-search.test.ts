import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { router } from "@inertiajs/react";
import { GLOBAL_SEARCH_DEBOUNCE_MS } from "./types";
import { useGlobalSearch } from "./use-global-search";

vi.mock("@inertiajs/react", () => ({ router: { visit: vi.fn<(href: string) => void>() } }));

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

const page1 = {
  data: [
    {
      category: { name: "products" },
      item: {
        id: "1",
        title: "Widget 1",
        subtitle: null,
        additionalInfo: null,
        link: "/products/1",
        badge: null,
      },
    },
  ],
  categories: [{ name: "products", label: "Products", icon: "package", count: null }],
  pagination: { page: 1, perPage: 1, total: 2, hasMore: true, nextPage: 2 },
  state: { query: "wid", category: "products", perPage: 1, countsIncluded: false },
};
const page2 = {
  data: [
    {
      category: { name: "products" },
      item: {
        id: "2",
        title: "Widget 2",
        subtitle: null,
        additionalInfo: null,
        link: "/products/2",
        badge: null,
      },
    },
  ],
  categories: page1.categories,
  pagination: { page: 2, perPage: 1, total: 2, hasMore: false, nextPage: null },
  state: { query: "wid", category: "products", perPage: 1, countsIncluded: false },
};

describe("useGlobalSearch", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("debounces the query then fetches results", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => jsonResponse(page1));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() =>
      useGlobalSearch({ endpoint: "/lattice/global-search", perPage: 1 }),
    );
    act(() => result.current.setQuery("wid"));

    expect(fetchMock).not.toHaveBeenCalled(); // still within debounce window
    await act(async () => {
      await vi.advanceTimersByTimeAsync(GLOBAL_SEARCH_DEBOUNCE_MS);
    });

    await waitFor(() => expect(result.current.results).toHaveLength(1));
    expect(result.current.results[0]?.item.id).toBe("1");
  });

  it("appends the next page on loadMore", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(page1))
      .mockResolvedValueOnce(jsonResponse(page2));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() =>
      useGlobalSearch({ endpoint: "/lattice/global-search", perPage: 1 }),
    );
    act(() => result.current.setQuery("wid"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(GLOBAL_SEARCH_DEBOUNCE_MS);
    });
    await waitFor(() => expect(result.current.results).toHaveLength(1));

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.results).toHaveLength(2));
    expect(result.current.results[1]?.item.id).toBe("2");
  });

  it("ignores a stale response whose echoed query no longer matches", async () => {
    const fetchMock = vi.fn<typeof fetch>(async (_url, _init) => {
      const url = String(_url);
      // The first (stale) request resolves last but echoes the old query.
      return jsonResponse(url.includes("query=old") ? page1 : page2);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() =>
      useGlobalSearch({ endpoint: "/lattice/global-search", perPage: 1 }),
    );
    act(() => result.current.setQuery("old"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(GLOBAL_SEARCH_DEBOUNCE_MS);
    });
    act(() => result.current.setQuery("new"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(GLOBAL_SEARCH_DEBOUNCE_MS);
    });

    await waitFor(() => expect(result.current.results[0]?.item.id).toBe("2"));
  });

  it("records the selection over POST then navigates to the re-resolved link", async () => {
    vi.useRealTimers();
    const recordResponse = {
      data: {
        category: { name: "products" },
        item: {
          id: "9",
          title: "Canonical",
          subtitle: null,
          additionalInfo: null,
          link: "/products/9",
          badge: null,
        },
      },
      state: { recorded: false },
    };
    const fetchMock = vi.fn<typeof fetch>(async () => jsonResponse(recordResponse));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() =>
      useGlobalSearch({ endpoint: "/lattice/global-search", perPage: 1 }),
    );
    // The client-supplied link is deliberately wrong; navigation must use the re-resolved row.
    const clicked = {
      category: { name: "products" },
      item: {
        id: "9",
        title: "Client Title",
        subtitle: null,
        additionalInfo: null,
        link: "/client/9",
        badge: null,
      },
    };

    result.current.openResult(clicked);

    await waitFor(() => expect(router.visit).toHaveBeenCalledWith("/products/9"));
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("POST");
  });
});
