import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GlobalSearchProvider } from "../context";
import type { SearchResult, UseGlobalSearchReturn } from "../types";
import GlobalSearchResults from "./results";

function row(id: string, title: string): SearchResult {
  return { category: { name: "products" }, item: { id, title, subtitle: "SKU-" + id, additionalInfo: null, link: "/products/" + id, badge: null } };
}

function harness(overrides: Partial<UseGlobalSearchReturn> = {}) {
  const setFocusedId = vi.fn();
  const openResult = vi.fn();
  const loadMore = vi.fn();
  const value: UseGlobalSearchReturn = {
    query: "wid", setQuery: vi.fn(), categories: [], activeCategory: "products", setCategory: vi.fn(),
    results: [row("1", "Widget 1"), row("2", "Widget 2")], recent: [], pagination: { page: 1, perPage: 20, total: 2, hasMore: false, nextPage: null },
    status: "success", error: null, focusedId: "1", setFocusedId, openResult, loadMore, refreshRecent: vi.fn(),
    ...overrides,
  };

  render(<GlobalSearchProvider value={value}><GlobalSearchResults node={{ type: "global-search.results", props: {} } as never}>{null}</GlobalSearchResults></GlobalSearchProvider>);

  return { setFocusedId, openResult, loadMore };
}

describe("GlobalSearchResults", () => {
  it("renders rows with title and joined subtitle", () => {
    harness();
    expect(screen.getByText("Widget 1")).toBeInTheDocument();
    expect(screen.getByText("SKU-1")).toBeInTheDocument();
  });

  it("moves focus with arrow keys and opens on Enter", () => {
    const { setFocusedId, openResult } = harness();
    const list = screen.getByRole("listbox");

    fireEvent.keyDown(list, { key: "ArrowDown" });
    expect(setFocusedId).toHaveBeenCalledWith("2");

    fireEvent.keyDown(list, { key: "Enter" });
    expect(openResult).toHaveBeenCalledWith(expect.objectContaining({ item: expect.objectContaining({ id: "1" }) }));
  });

  it("shows the empty state when there are no results", () => {
    harness({ results: [], status: "success" });
    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });
});
